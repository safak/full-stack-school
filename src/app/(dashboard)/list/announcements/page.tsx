import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Announcement, Ministry, CellGroup, Member, Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

type AnnouncementList = Announcement & { 
  ministry: Ministry | null;
  cellGroup: CellGroup | null;
  createdByMember: Member;
};

const AnnouncementListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;
  
  const columns = [
    {
      header: "Title",
      accessor: "title",
    },
    {
      header: "Content",
      accessor: "content",
      className: "hidden lg:table-cell",
    },
    {
      header: "Target Audience",
      accessor: "audience",
      className: "hidden md:table-cell",
    },
    {
      header: "Priority",
      accessor: "priority",
      className: "hidden md:table-cell",
    },
    {
      header: "Date",
      accessor: "date",
      className: "hidden md:table-cell",
    },
    {
      header: "Posted By",
      accessor: "postedBy",
      className: "hidden xl:table-cell",
    },
    ...(role === "admin" || role === "super_admin" || role === "pastor" || role === "ministryLeader"
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];
  
  const renderRow = (item: AnnouncementList) => {
    // Get priority color
    const getPriorityColor = (priority: string) => {
      switch(priority) {
        case "URGENT": return "bg-red-100 text-red-700";
        case "HIGH": return "bg-orange-100 text-orange-700";
        case "NORMAL": return "bg-blue-100 text-blue-700";
        case "LOW": return "bg-gray-100 text-gray-700";
        default: return "bg-gray-100 text-gray-700";
      }
    };

    // Get priority icon
    const getPriorityIcon = (priority: string) => {
      switch(priority) {
        case "URGENT": return "🔴";
        case "HIGH": return "🟠";
        case "NORMAL": return "🔵";
        case "LOW": return "⚪";
        default: return "📢";
      }
    };

    // Format audience display
    const formatAudience = (audience: string, ministry?: string | null, cellGroup?: string | null) => {
      if (audience === "EVERYONE") return "Everyone";
      if (audience === "MEMBERS_ONLY") return "All Members";
      if (audience === "LEADERSHIP") return "Leadership";
      if (audience === "MINISTRY" && ministry) return `Ministry: ${ministry}`;
      if (audience === "CELL_GROUP" && cellGroup) return `Cell: ${cellGroup}`;
      return audience;
    };

    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-purple-50 transition-colors"
      >
        <td className="p-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getPriorityIcon(item.priority)}</span>
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-gray-400 md:hidden mt-1">
                {formatAudience(item.targetAudience, item.ministry?.name, item.cellGroup?.name)} • {new Date(item.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </td>
        <td className="hidden lg:table-cell max-w-xs">
          <p className="truncate">{item.content}</p>
        </td>
        <td className="hidden md:table-cell">
          <span className="text-sm">
            {formatAudience(item.targetAudience, item.ministry?.name, item.cellGroup?.name)}
          </span>
        </td>
        <td className="hidden md:table-cell">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
            {item.priority}
          </span>
        </td>
        <td className="hidden md:table-cell">
          {new Intl.DateTimeFormat("en-US", {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }).format(item.date)}
        </td>
        <td className="hidden xl:table-cell">
          {item.createdByMember ? (
            <div>
              <p>{item.createdByMember.firstName} {item.createdByMember.lastName}</p>
              <p className="text-xs text-gray-400">Posted</p>
            </div>
          ) : "—"}
        </td>
        <td>
          <div className="flex items-center gap-2">
            {(role === "admin" || role === "super_admin" || role === "pastor" || role === "ministryLeader") && (
              <>
                <FormContainer table="announcement" type="update" data={item} />
                <FormContainer table="announcement" type="delete" id={item.id} />
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION
  const query: Prisma.AnnouncementWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "priority":
            query.priority = value as any;
            break;
          case "targetAudience":
            query.targetAudience = value as any;
            break;
          case "ministryId":
            query.ministryId = parseInt(value);
            break;
          case "cellGroupId":
            query.cellGroupId = parseInt(value);
            break;
          case "search":
            query.OR = [
              { title: { contains: value, mode: "insensitive" } },
              { content: { contains: value, mode: "insensitive" } },
              { createdByMember: { 
                  firstName: { contains: value, mode: "insensitive" } 
                } 
              },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // ROLE CONDITIONS
  const [data, count] = await prisma.$transaction([
    prisma.announcement.findMany({
      where: query,
      include: {
        ministry: { select: { name: true } },
        cellGroup: { select: { name: true } },
        createdByMember: { select: { firstName: true, lastName: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: {
        date: 'desc',
      },
    }),
    prisma.announcement.count({ where: query }),
  ]);

  // Get announcement counts by priority
  const urgentCount = data.filter(a => a.priority === "URGENT").length;
  const highCount = data.filter(a => a.priority === "HIGH").length;
  const normalCount = data.filter(a => a.priority === "NORMAL").length;

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="hidden md:block text-lg font-semibold text-gray-700">
            Church Announcements
          </h1>
          <div className="flex gap-2 mt-1">
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              Total: {count}
            </span>
            {urgentCount > 0 && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                Urgent: {urgentCount}
              </span>
            )}
            {highCount > 0 && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                High: {highCount}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-100 hover:bg-purple-200 transition-colors">
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-100 hover:bg-purple-200 transition-colors">
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>
            {(role === "admin" || role === "super_admin" || role === "pastor" || role === "ministryLeader") && (
              <FormContainer table="announcement" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* Priority Legend */}
      <div className="flex gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <span>🔴</span>
          <span>Urgent</span>
        </div>
        <div className="flex items-center gap-1">
          <span>🟠</span>
          <span>High</span>
        </div>
        <div className="flex items-center gap-1">
          <span>🔵</span>
          <span>Normal</span>
        </div>
        <div className="flex items-center gap-1">
          <span>⚪</span>
          <span>Low</span>
        </div>
      </div>

      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />

      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default AnnouncementListPage;

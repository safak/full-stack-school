import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { OutreachProgram, Ministry, CellGroup, Pastor, Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

type OutreachProgramList = OutreachProgram & {
  ministry: Ministry | null;
  cellGroup: CellGroup | null;
  leader: Pastor | null;
};

const OutreachProgramListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;
  
  const columns = [
    {
      header: "Program Name",
      accessor: "name",
    },
    {
      header: "Ministry",
      accessor: "ministry",
      className: "hidden lg:table-cell",
    },
    {
      header: "Cell Group",
      accessor: "cellGroup",
      className: "hidden lg:table-cell",
    },
    {
      header: "Leader",
      accessor: "leader",
      className: "hidden md:table-cell",
    },
    {
      header: "Due Date",
      accessor: "dueDate",
      className: "hidden md:table-cell",
    },
    {
      header: "Location",
      accessor: "location",
      className: "hidden xl:table-cell",
    },
    {
      header: "Status",
      accessor: "status",
      className: "hidden xl:table-cell",
    },
    ...(role === "admin" || role === "super_admin" || role === "pastor" || role === "evangelismLeader"
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];
  
  const renderRow = (item: OutreachProgramList) => {
    // Format date
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat("en-US", {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(date);
    };

    // Determine if program is upcoming, ongoing, or past due
    const today = new Date();
    const dueDate = new Date(item.dueDate);
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    let statusText = "";
    let statusColor = "";
    
    if (daysUntilDue < 0) {
      statusText = "Past Due";
      statusColor = "bg-red-100 text-red-700";
    } else if (daysUntilDue <= 7) {
      statusText = "Urgent";
      statusColor = "bg-orange-100 text-orange-700";
    } else if (daysUntilDue <= 30) {
      statusText = "Upcoming";
      statusColor = "bg-green-100 text-green-700";
    } else {
      statusText = "Planning";
      statusColor = "bg-blue-100 text-blue-700";
    }

    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-purple-50 transition-colors"
      >
        <td className="p-4">
          <div>
            <p className="font-medium">{item.title}</p>
            <p className="text-xs text-gray-400 md:hidden mt-1">
              {formatDate(item.dueDate)} • {item.location || "TBD"}
            </p>
          </div>
        </td>
        <td className="hidden lg:table-cell">
          {item.ministry ? (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
              {item.ministry.name}
            </span>
          ) : "—"}
        </td>
        <td className="hidden lg:table-cell">
          {item.cellGroup ? (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
              {item.cellGroup.name}
            </span>
          ) : "—"}
        </td>
        <td className="hidden md:table-cell">
          {item.leader ? (
            <div>
              <p>{item.leader.name} {item.leader.surname}</p>
              <p className="text-xs text-gray-400">Leader</p>
            </div>
          ) : "—"}
        </td>
        <td className="hidden md:table-cell">
          <div>
            <p>{formatDate(item.dueDate)}</p>
            {daysUntilDue >= 0 && daysUntilDue <= 30 && (
              <p className="text-xs text-gray-400">{daysUntilDue} days left</p>
            )}
          </div>
        </td>
        <td className="hidden xl:table-cell">
          <span className="text-sm">{item.location || "TBD"}</span>
        </td>
        <td className="hidden xl:table-cell">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
            {statusText}
          </span>
        </td>
        <td>
          <div className="flex items-center gap-2">
            {(role === "admin" || role === "super_admin" || role === "pastor" || role === "evangelismLeader") && (
              <>
                <FormModal table="outreach" type="update" data={item} />
                <FormModal table="outreach" type="delete" id={item.id} />
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
  const query: Prisma.OutreachProgramWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "ministryId":
            query.ministryId = parseInt(value);
            break;
          case "cellGroupId":
            query.cellGroupId = parseInt(value);
            break;
          case "leaderId":
            query.leaderId = value;
            break;
          case "search":
            query.OR = [
              { title: { contains: value, mode: "insensitive" } },
              { location: { contains: value, mode: "insensitive" } },
              { description: { contains: value, mode: "insensitive" } },
              { ministry: { name: { contains: value, mode: "insensitive" } } },
              { cellGroup: { name: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // ROLE CONDITIONS
  switch (role) {
    case "admin":
    case "super_admin":
      break;
    case "pastor":
      // Pastors can see all outreach programs
      break;
    case "evangelismLeader":
      // Evangelism leaders see all
      break;
    case "ministryLeader":
      // Ministry leaders see programs from their ministry
      query.ministry = {
        leaderId: currentUserId!
      };
      break;
    case "cellLeader":
      // Cell leaders see programs from their cell group
      query.cellGroup = {
        leaderId: currentUserId!
      };
      break;
    case "member":
      // Members see programs from their cell group/ministry
      query.OR = [
        { cellGroup: { members: { some: { id: currentUserId! } } } },
        { ministry: { members: { some: { id: currentUserId! } } } }
      ];
      break;
    default:
      break;
  }

  const [data, count] = await prisma.$transaction([
    prisma.outreachProgram.findMany({
      where: query,
      include: {
        ministry: { select: { name: true } },
        cellGroup: { select: { name: true } },
        leader: { select: { name: true, surname: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: {
        dueDate: 'asc',
      },
    }),
    prisma.outreachProgram.count({ where: query }),
  ]);

  // Calculate statistics
  const upcomingCount = data.filter(item => new Date(item.dueDate) > new Date()).length;
  const urgentCount = data.filter(item => {
    const daysUntil = Math.ceil((new Date(item.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    return daysUntil >= 0 && daysUntil <= 7;
  }).length;

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="hidden md:block text-lg font-semibold text-gray-700">
            Outreach Programs
          </h1>
          <div className="flex gap-2 mt-1">
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              Total: {count}
            </span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Upcoming: {upcomingCount}
            </span>
            {urgentCount > 0 && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                Urgent: {urgentCount}
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
            {(role === "admin" || role === "super_admin" || role === "pastor" || role === "evangelismLeader") && (
              <FormModal table="outreach" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
        <div className="bg-green-50 p-2 rounded-lg text-center">
          <p className="text-xs text-gray-500">Planning</p>
          <p className="text-lg font-bold text-green-600">
            {data.filter(item => {
              const daysUntil = Math.ceil((new Date(item.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
              return daysUntil > 30;
            }).length}
          </p>
        </div>
        <div className="bg-blue-50 p-2 rounded-lg text-center">
          <p className="text-xs text-gray-500">Upcoming</p>
          <p className="text-lg font-bold text-blue-600">
            {data.filter(item => {
              const daysUntil = Math.ceil((new Date(item.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
              return daysUntil > 7 && daysUntil <= 30;
            }).length}
          </p>
        </div>
        <div className="bg-orange-50 p-2 rounded-lg text-center">
          <p className="text-xs text-gray-500">Urgent</p>
          <p className="text-lg font-bold text-orange-600">{urgentCount}</p>
        </div>
        <div className="bg-red-50 p-2 rounded-lg text-center">
          <p className="text-xs text-gray-500">Past Due</p>
          <p className="text-lg font-bold text-red-600">
            {data.filter(item => new Date(item.dueDate) < new Date()).length}
          </p>
        </div>
      </div>

      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />

      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default OutreachProgramListPage;

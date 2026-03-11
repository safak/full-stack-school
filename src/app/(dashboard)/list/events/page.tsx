import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Event, Ministry, CellGroup, Member, Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

type EventList = Event & { 
  ministry: Ministry | null;
  cellGroup: CellGroup | null;
  organizer: Member | null;
};

const EventListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  const columns = [
    {
      header: "Event Title",
      accessor: "title",
    },
    {
      header: "Type",
      accessor: "type",
      className: "hidden md:table-cell",
    },
    {
      header: "Ministry/Cell",
      accessor: "group",
      className: "hidden lg:table-cell",
    },
    {
      header: "Date",
      accessor: "date",
      className: "hidden md:table-cell",
    },
    {
      header: "Time",
      accessor: "time",
      className: "hidden xl:table-cell",
    },
    {
      header: "Location",
      accessor: "location",
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

  const renderRow = (item: EventList) => {
    // Format event type
    const formatEventType = (type: string) => {
      return type.split('_').map(word => 
        word.charAt(0) + word.slice(1).toLowerCase()
      ).join(' ');
    };

    // Get event icon based on type
    const getEventIcon = (type: string) => {
      switch(type) {
        case "SUNDAY_SERVICE": return "⛪";
        case "BIBLE_STUDY": return "📖";
        case "PRAYER_MEETING": return "🙏";
        case "CELL_MEETING": return "👥";
        case "CONFERENCE": return "🎤";
        case "OUTREACH": return "🤝";
        case "WEDDING": return "💒";
        case "BAPTISM": return "💧";
        case "DEDICATION": return "👶";
        default: return "📅";
      }
    };

    // Get color for event type badge
    const getTypeColor = (type: string) => {
      switch(type) {
        case "SUNDAY_SERVICE": return "bg-purple-100 text-purple-700";
        case "BIBLE_STUDY": return "bg-blue-100 text-blue-700";
        case "PRAYER_MEETING": return "bg-green-100 text-green-700";
        case "CELL_MEETING": return "bg-yellow-100 text-yellow-700";
        case "CONFERENCE": return "bg-red-100 text-red-700";
        case "OUTREACH": return "bg-orange-100 text-orange-700";
        case "WEDDING": return "bg-pink-100 text-pink-700";
        case "BAPTISM": return "bg-indigo-100 text-indigo-700";
        case "DEDICATION": return "bg-teal-100 text-teal-700";
        default: return "bg-gray-100 text-gray-700";
      }
    };

    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-purple-50 transition-colors"
      >
        <td className="p-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getEventIcon(item.eventType)}</span>
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-gray-400 md:hidden mt-1">
                {formatEventType(item.eventType)} • {new Date(item.startDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </td>
        <td className="hidden md:table-cell">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.eventType)}`}>
            {formatEventType(item.eventType)}
          </span>
        </td>
        <td className="hidden lg:table-cell">
          {item.ministry?.name && (
            <div className="flex items-center gap-1">
              <span className="text-xs bg-purple-50 px-2 py-1 rounded">🙏 {item.ministry.name}</span>
            </div>
          )}
          {item.cellGroup?.name && !item.ministry && (
            <div className="flex items-center gap-1">
              <span className="text-xs bg-yellow-50 px-2 py-1 rounded">👥 {item.cellGroup.name}</span>
            </div>
          )}
          {!item.ministry && !item.cellGroup && <span className="text-gray-400">—</span>}
        </td>
        <td className="hidden md:table-cell">
          {new Intl.DateTimeFormat("en-US", {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          }).format(item.startDate)}
        </td>
        <td className="hidden xl:table-cell">
          {new Date(item.startDate).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })} - {new Date(item.endDate).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </td>
        <td className="hidden xl:table-cell">
          <span className="text-sm">{item.location || "TBD"}</span>
          {item.organizer && (
            <p className="text-xs text-gray-400">by {item.organizer.firstName} {item.organizer.lastName}</p>
          )}
        </td>
        <td>
          <div className="flex items-center gap-2">
            {(role === "admin" || role === "super_admin" || role === "pastor" || role === "ministryLeader") && (
              <>
                <FormContainer table="event" type="update" data={item} />
                <FormContainer table="event" type="delete" id={item.id} />
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
  const query: Prisma.EventWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "eventType":
            query.eventType = value as any;
            break;
          case "ministryId":
            query.ministryId = parseInt(value);
            break;
          case "cellGroupId":
            query.cellGroupId = parseInt(value);
            break;
          case "organizerId":
            query.organizerId = value;
            break;
          case "startDate":
            query.startDate = { gte: new Date(value) };
            break;
          case "endDate":
            query.endDate = { lte: new Date(value) };
            break;
          case "search":
            query.OR = [
              { title: { contains: value, mode: "insensitive" } },
              { description: { contains: value, mode: "insensitive" } },
              { location: { contains: value, mode: "insensitive" } },
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
      // Can see all events
      break;
    case "pastor":
      // Pastors see all events
      break;
    case "ministryLeader":
      // Ministry leaders see events from their ministry
      query.OR = [
        { ministryId: { not: null } },
        { organizerId: currentUserId! }
      ];
      break;
    case "cellLeader":
      // Cell leaders see events from their cell group
      query.cellGroupId = { not: null };
      break;
    case "member":
      // Members see public events and events from their cell group/ministry
      query.OR = [
        { cellGroup: { members: { some: { id: currentUserId! } } } },
        { ministry: { members: { some: { id: currentUserId! } } } },
        { organizerId: currentUserId! }
      ];
      break;
    default:
      break;
  }

  const [data, count] = await prisma.$transaction([
    prisma.event.findMany({
      where: query,
      include: {
        ministry: { select: { name: true } },
        cellGroup: { select: { name: true } },
        organizer: { select: { firstName: true, lastName: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: {
        startDate: 'asc',
      },
    }),
    prisma.event.count({ where: query }),
  ]);

  // Get event counts for summary
  const upcomingCount = await prisma.event.count({
    where: {
      startDate: {
        gte: new Date(),
      },
    },
  });

  const todayCount = await prisma.event.count({
    where: {
      startDate: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
        lte: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    },
  });

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="hidden md:block text-lg font-semibold text-gray-700">
            Church Events
          </h1>
          <div className="flex gap-2 mt-1">
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              Total: {count}
            </span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Upcoming: {upcomingCount}
            </span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              Today: {todayCount}
            </span>
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
              <FormContainer table="event" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* Quick Filter Tabs */}
      <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
        <button className="px-3 py-1 text-xs bg-purple-600 text-white rounded-full hover:bg-purple-700 whitespace-nowrap">
          All Events
        </button>
        <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 whitespace-nowrap">
          Sunday Services
        </button>
        <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 whitespace-nowrap">
          Bible Studies
        </button>
        <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 whitespace-nowrap">
          Prayer Meetings
        </button>
        <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 whitespace-nowrap">
          Cell Meetings
        </button>
        <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 whitespace-nowrap">
          Outreach
        </button>
      </div>

      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />

      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default EventListPage;

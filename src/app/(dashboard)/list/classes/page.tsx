import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { CellGroup, Pastor, MembershipLevel, Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

type CellGroupList = CellGroup & { 
  leader: Pastor | null;
  level: MembershipLevel;
  _count: {
    members: number;
  };
};

const CellGroupListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    {
      header: "Cell Group Name",
      accessor: "name",
    },
    {
      header: "Members",
      accessor: "members",
      className: "hidden md:table-cell",
    },
    {
      header: "Capacity",
      accessor: "capacity",
      className: "hidden md:table-cell",
    },
    {
      header: "Level",
      accessor: "level",
      className: "hidden lg:table-cell",
    },
    {
      header: "Leader",
      accessor: "leader",
      className: "hidden lg:table-cell",
    },
    {
      header: "Meeting Day",
      accessor: "meetingDay",
      className: "hidden xl:table-cell",
    },
    ...(role === "admin" || role === "super_admin" || role === "pastor"
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];

  const renderRow = (item: CellGroupList) => {
    // Calculate occupancy percentage
    const occupancyPercentage = Math.round((item._count.members / item.capacity) * 100);
    
    // Determine occupancy color
    const getOccupancyColor = (percentage: number) => {
      if (percentage >= 90) return "text-red-600 bg-red-50";
      if (percentage >= 75) return "text-orange-600 bg-orange-50";
      if (percentage >= 50) return "text-yellow-600 bg-yellow-50";
      return "text-green-600 bg-green-50";
    };

    // Format meeting day
    const formatDay = (day: string | null) => {
      if (!day) return "TBD";
      return day.charAt(0) + day.slice(1).toLowerCase();
    };

    const occupancyColor = getOccupancyColor(occupancyPercentage);

    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-purple-50 transition-colors"
      >
        <td className="p-4">
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-xs text-gray-400 md:hidden mt-1">
              {item._count.members}/{item.capacity} members • {formatDay(item.meetingDay)}
            </p>
          </div>
        </td>
        <td className="hidden md:table-cell">
          <div className="flex items-center gap-2">
            <span className="font-medium">{item._count.members}</span>
            <span className="text-xs text-gray-400">/ {item.capacity}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${occupancyColor}`}>
              {occupancyPercentage}%
            </span>
          </div>
        </td>
        <td className="hidden md:table-cell">{item.capacity}</td>
        <td className="hidden lg:table-cell">
          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
            Level {item.level.level}: {item.level.name}
          </span>
        </td>
        <td className="hidden lg:table-cell">
          {item.leader ? (
            <div>
              <p>{item.leader.name} {item.leader.surname}</p>
              <p className="text-xs text-gray-400">Pastor</p>
            </div>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </td>
        <td className="hidden xl:table-cell">
          <div>
            <p>{formatDay(item.meetingDay)}</p>
            {item.meetingTime && (
              <p className="text-xs text-gray-400">
                {new Date(item.meetingTime).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </p>
            )}
          </div>
        </td>
        <td>
          <div className="flex items-center gap-2">
            {(role === "admin" || role === "super_admin" || role === "pastor") && (
              <>
                <FormContainer table="cellGroup" type="update" data={item} />
                <FormContainer table="cellGroup" type="delete" id={item.id} />
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
  const query: Prisma.CellGroupWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "leaderId":
            query.leaderId = value;
            break;
          case "levelId":
            query.levelId = parseInt(value);
            break;
          case "meetingDay":
            query.meetingDay = value as any;
            break;
          case "search":
            query.OR = [
              { name: { contains: value, mode: "insensitive" } },
              { location: { contains: value, mode: "insensitive" } },
              { leader: { name: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.cellGroup.findMany({
      where: query,
      include: {
        leader: { select: { name: true, surname: true } },
        level: { select: { level: true, name: true } },
        _count: {
          select: { members: true },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: {
        name: 'asc',
      },
    }),
    prisma.cellGroup.count({ where: query }),
  ]);

  // Get summary statistics
  const totalMembers = data.reduce((sum, group) => sum + group._count.members, 0);
  const totalCapacity = data.reduce((sum, group) => sum + group.capacity, 0);
  const overallOccupancy = totalCapacity > 0 ? Math.round((totalMembers / totalCapacity) * 100) : 0;

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="hidden md:block text-lg font-semibold text-gray-700">
            Cell Groups
          </h1>
          <div className="flex gap-2 mt-1">
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              Total Groups: {count}
            </span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Members: {totalMembers}
            </span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              Occupancy: {overallOccupancy}%
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
            {(role === "admin" || role === "super_admin" || role === "pastor") && (
              <FormContainer table="cellGroup" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-4">
        <div className="bg-purple-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Active Cell Groups</p>
          <p className="text-xl font-bold text-purple-600">{data.length}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Total Members</p>
          <p className="text-xl font-bold text-green-600">{totalMembers}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Average Group Size</p>
          <p className="text-xl font-bold text-blue-600">
            {data.length > 0 ? Math.round(totalMembers / data.length) : 0}
          </p>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Available Slots</p>
          <p className="text-xl font-bold text-yellow-600">{totalCapacity - totalMembers}</p>
        </div>
      </div>

      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />

      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default CellGroupListPage;

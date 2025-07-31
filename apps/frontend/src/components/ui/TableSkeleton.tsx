/* eslint-disable @typescript-eslint/no-explicit-any */
import { Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import { useReactTable, flexRender, getCoreRowModel, ColumnDef } from "@tanstack/react-table";

export type DataTableProps<Data extends object> = {
  data: Data[];
  columns: ColumnDef<Data, any>[];
};

export const DataTable = <Data extends object>({ data, columns }: DataTableProps<Data>) => {
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table>
      <Thead>
        {table.getHeaderGroups().map(headerGroup => (
          <Tr key={headerGroup.id}>
            {headerGroup.headers.map((header, index) => {
              const meta: any = header.column.columnDef.meta;
              return (
                <Th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  isNumeric={meta?.isNumeric}
                  backgroundColor={"gray.100"}
                  borderRadius={
                    index === 0 ? "4px 0 0 4px" : index === headerGroup.headers.length - 1 ? "0 4px 4px 0" : "0"
                  }>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </Th>
              );
            })}
          </Tr>
        ))}
      </Thead>
      <Tbody>
        {table.getRowModel().rows.map(row => (
          <Tr key={row.id}>
            {row.getVisibleCells().map(cell => {
              const meta: any = cell.column.columnDef.meta;
              return (
                <Td key={cell.id} isNumeric={meta?.isNumeric}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Td>
              );
            })}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

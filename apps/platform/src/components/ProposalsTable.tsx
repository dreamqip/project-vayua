import { Skeleton } from '@/components/ui/Skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import useProposalSnapshot from '@/hooks/use-proposal-snapshot';
import { GOVERNOR_ABI } from '@/utils/abi/openzeppelin-contracts';
import {
  blockNumberToDate,
  getProposalTitle,
  proposalTimestampToDate,
} from '@/utils/helpers/proposal.helper';
import { shortenText } from '@/utils/helpers/shorten.helper';
import { badgeVariantMap, proposalStateMap } from '@/utils/proposal-states';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useContractRead, usePublicClient } from 'wagmi';

import { DataTablePagination } from './ProposalsTablePagination';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import Spinner from './ui/Spinner';

interface ProposalsTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  organisationAddress: `0x${string}`;
  scannedBlocksCounter: number;
  toScanBlocksCounter: number;
}

export function ProposalsTable<TData, TValue>({
  columns,
  data,
  organisationAddress,
  scannedBlocksCounter,
  toScanBlocksCounter,
}: ProposalsTableProps<TData, TValue>) {
  const [sortedData, setSortedData] = useState([...data]);

  useEffect(() => {
    const sortedArray = [...data].sort((a, b) =>
      BigInt((a as any).voteStart) > BigInt((b as any).voteStart) ? -1 : 1,
    );
    setSortedData(sortedArray);
  }, [data]);

  const table = useReactTable({
    autoResetPageIndex: false,
    columns,
    data: sortedData,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  return (
    <div className='rounded-md border sm:p-5 bg-white col-span-2'>
      <div className='min-h-[480px]'>
        <Table className='min-h-full'>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      <div className='flex flex-row flex-wrap items-center py-3'>
                        <div className='mr-5 flex items-center '>
                          <h2 className='text-base'>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </h2>
                          {toScanBlocksCounter > 0 && (
                            <Spinner className='ml-2' color='#000' size={20} />
                          )}
                        </div>
                        <div className='gap-5 sm:flex'>
                          <div>
                            Scanned{' '}
                            <span className='font-semibold text-slate-500 '>
                              {scannedBlocksCounter}
                            </span>{' '}
                            blocks
                          </div>
                          <div>
                            Left{' '}
                            <span className='font-semibold text-slate-500 '>
                              {toScanBlocksCounter >= 0
                                ? toScanBlocksCounter
                                : 0}
                            </span>{' '}
                            blocks
                          </div>
                        </div>
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  data-state={row.getIsSelected() && 'selected'}
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell colSpan={columns.length} key={cell.id}>
                      <ProposalTableItem
                        cellparams={cell.getContext()}
                        organisationAddress={organisationAddress}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <div className='flex min-h-[400px] flex-col items-center justify-center text-center'>
                    <X size={30} />
                    <h3 className='mt-3 text-base font-semibold'>
                      There aren&apos;t any proposals yet
                    </h3>
                    <div className='mt-2'>
                      You could create a{' '}
                      <Link
                        className='text-success'
                        href={`${organisationAddress}/proposals/new`}
                      >
                        new proposal
                      </Link>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}

function ProposalTableItem({
  cellparams,
  organisationAddress,
}: {
  cellparams: any;
  organisationAddress: `0x${string}`;
}) {
  const proposal = cellparams.cell.row.original;

  const publicClient = usePublicClient();
  const [proposalState, setProposalState] = useState('Unknown State');

  // get snapshot
  const [, proposalSnapshotDate] = useProposalSnapshot(
    publicClient,
    organisationAddress,
    proposal.proposalId,
  );

  // get proposal state
  useContractRead({
    abi: GOVERNOR_ABI,
    address: organisationAddress,
    args: [proposal.proposalId],
    functionName: 'state',
    onSuccess(data) {
      setProposalState(proposalStateMap[data ? data : -1] || 'Unknown State');
      // TODO: refactor proposal state if watch works
    },
  });

  return (
    <div className='flex items-center justify-between'>
      <div>
        <h3 className='text-base font-semibold'>
          {getProposalTitle(proposal.description)}
        </h3>
        <div className='mt-2 flex flex-col items-start gap-2 md:flex-row'>
          {proposalState == 'Unknown State' ? (
            <Skeleton className='h-[22px] w-[75px] rounded-full' />
          ) : (
            <Badge variant={badgeVariantMap[proposalState]}>
              {proposalState}
            </Badge>
          )}
          {shortenText(proposal.proposalId, 0, 4, '#')}
          {proposalSnapshotDate == '' ? (
            <Skeleton className='h-[22px] w-[190px] rounded-full' />
          ) : (
            <div>Proposed on {proposalSnapshotDate}</div>
          )}
        </div>
      </div>
      <Button asChild className='mt-5 md:m-0' size='sm' variant='link'>
        <Link
          href={{
            pathname: `${organisationAddress}/proposals/${proposal.proposalId}`,
            query: {
              calldatas: proposal.calldatas,
              description: proposal.description,
              proposer: proposal.proposer,
              targets: proposal.targets,
              values: proposal.values,
              voteEnd: proposal.voteEnd,
              voteStart: proposal.voteStart,
            },
          }}
        >
          More
        </Link>
      </Button>
    </div>
  );
}

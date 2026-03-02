'use client'

import { useSession } from 'next-auth/react'
import {
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { useState } from 'react'
import { Plus, Pencil, Trash2, ChevronRight } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import CustomPagination from '@/components/shared/pagination/custom-pagination'
import NotFound from '@/components/shared/NotFound/NotFound'
import ErrorContainer from '@/components/shared/ErrorContainer/ErrorContainer'
import AddTrainerModal from './_components/AddTrainerModal'
import EditTrainerModal from './_components/EditTrainerModal'
import DeleteTrainerModal from './_components/DeleteTrainerModal'

interface Trainer {
  _id: string
  name: string
  email: string
  phone?: string
  role: string
  status?: string
  isVerified: boolean
  createdAt: string
}

interface ApiResponse {
  status: boolean
  message: string
  data: {
    items: Trainer[]
    pagination: {
      page: number
      limit: number
      totalItems: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }
}

const LIMIT = 8

const TrainersPage = () => {
  const { data: session } = useSession()
  const accessToken = session?.user?.accessToken
  const queryClient = useQueryClient()

  const [currentPage, setCurrentPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editTrainer, setEditTrainer] = useState<Trainer | null>(null)
  const [deleteTrainerId, setDeleteTrainerId] = useState<string | null>(null)
  const [deleteTrainerName, setDeleteTrainerName] = useState<string>('')

  const { data, isLoading, isError } = useQuery<ApiResponse>({
    queryKey: ['trainers', currentPage],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/trainer?page=${currentPage}&limit=${LIMIT}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )
      if (!res.ok) throw new Error('Failed to fetch trainers')
      return res.json()
    },
    enabled: !!accessToken,
    placeholderData: keepPreviousData,
  })

  const trainers = data?.data?.items || []
  const total = data?.data?.pagination?.totalItems || 0
  const totalPages = data?.data?.pagination?.totalPages || 1

  const handleRefresh = () => {
    setCurrentPage(1)
    queryClient.invalidateQueries({ queryKey: ['trainers'] })
  }

  return (
    <div className="w-full">
      {/* Page Title */}
      <div className="mb-2">
        <h1
          style={{
            fontFamily: 'var(--font-nunito), sans-serif',
            fontWeight: 700,
            fontSize: '24px',
            lineHeight: '120%',
            color: '#00253E',
          }}
        >
          Trainer Management
        </h1>
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm mb-6">
        <Link
          href="/dashboard"
          className="text-[#00253E] hover:text-primary transition-colors"
          style={{
            fontFamily: 'var(--font-nunito), sans-serif',
            fontWeight: 500,
            fontSize: '16px',
            lineHeight: '120%',
          }}
        >
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4 text-[#00253E]" />
        <span
          className="text-[#00253E]"
          style={{
            fontFamily: 'var(--font-nunito), sans-serif',
            fontWeight: 500,
            fontSize: '18px',
            lineHeight: '120%',
          }}
        >
          Trainer Management
        </span>
      </nav>

      {/* Add Button */}
      <div className="flex justify-end mb-6">
        <Button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 h-[44px] px-5 bg-primary text-[#00253E] font-semibold rounded-[8px] hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Add New Trainer
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-hidden bg-white">
        <Table className="border-none">
          <TableHeader>
            <TableRow className="bg-[#F1FFC5] hover:bg-[#F1FFC5] border-none">
              <TableHead
                className="text-[#00253E] font-normal py-4 pl-6 text-center"
                style={{
                  fontFamily: 'var(--font-nunito), sans-serif',
                  fontSize: '16px',
                  lineHeight: '120%',
                }}
              >
                Trainer name
              </TableHead>
              <TableHead
                className="text-[#00253E] font-normal py-4 text-center"
                style={{
                  fontFamily: 'var(--font-nunito), sans-serif',
                  fontSize: '16px',
                  lineHeight: '120%',
                }}
              >
                Email
              </TableHead>
              <TableHead
                className="text-[#00253E] font-normal py-4 text-center"
                style={{
                  fontFamily: 'var(--font-nunito), sans-serif',
                  fontSize: '16px',
                  lineHeight: '120%',
                }}
              >
                Role
              </TableHead>
              <TableHead
                className="text-[#00253E] font-normal py-4 text-center"
                style={{
                  fontFamily: 'var(--font-nunito), sans-serif',
                  fontSize: '16px',
                  lineHeight: '120%',
                }}
              >
                Status
              </TableHead>
              <TableHead
                className="text-[#00253E] font-normal py-4 pr-6 text-center"
                style={{
                  fontFamily: 'var(--font-nunito), sans-serif',
                  fontSize: '16px',
                  lineHeight: '120%',
                }}
              >
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Skeleton loader rows
              Array.from({ length: LIMIT }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-6 py-4">
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell className="py-4">
                    <Skeleton className="h-4 w-44" />
                  </TableCell>
                  <TableCell className="py-4">
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </TableCell>
                  <TableCell className="py-4">
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </TableCell>
                  <TableCell className="py-4 pr-6">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-7 w-7 rounded" />
                      <Skeleton className="h-7 w-7 rounded" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={5} className="py-6">
                  <ErrorContainer message="Failed to load trainers. Please try again." />
                </TableCell>
              </TableRow>
            ) : trainers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-6">
                  <NotFound message="No trainers found. Add your first trainer!" />
                </TableCell>
              </TableRow>
            ) : (
              trainers.map(trainer => (
                <TableRow
                  key={trainer._id}
                  className="hover:bg-gray-50 border-none"
                >
                  <TableCell
                    className="pl-6 py-4 text-center"
                    style={{
                      fontFamily: 'var(--font-nunito), sans-serif',
                      fontSize: '16px',
                      fontWeight: 400,
                      lineHeight: '120%',
                    }}
                  >
                    {trainer.name}
                  </TableCell>
                  <TableCell
                    className="py-4 text-center"
                    style={{
                      fontFamily: 'var(--font-nunito), sans-serif',
                      fontSize: '16px',
                      fontWeight: 400,
                      lineHeight: '120%',
                    }}
                  >
                    {trainer.email}
                  </TableCell>
                  <TableCell className="py-4 text-center">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full border-2 border-[#00AC0033] text-xs  font-medium bg-[#00AC0033] text-[#00253E] min-w-[80px]">
                      {trainer.role === 'TRAINER' ? 'Trainer' : trainer.role}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 text-center ">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full border-2 border-[#00AC0033] text-xs font-medium bg-[#00AC0033] text-[#00253E] min-w-[80px]">
                      {trainer.status}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 pr-6">
                    <div className="flex items-center justify-center gap-2">
                      {/* Edit */}
                      <button
                        onClick={() => setEditTrainer(trainer)}
                        className="w-8 h-8 flex items-center justify-center rounded bg-[#BADA55] text-[#00253E] hover:bg-[#BADA55]/90 transition-colors"
                        title="Edit trainer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => {
                          setDeleteTrainerId(trainer._id)
                          setDeleteTrainerName(trainer.name)
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded bg-[#FF333366] text-[#00253E] hover:bg-[#FF3333]/40 transition-colors"
                        title="Delete trainer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer: showing count + pagination */}
      {!isLoading && !isError && trainers.length > 0 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-sm text-gray-500">
            Showing {(currentPage - 1) * LIMIT + 1} to{' '}
            {Math.min(currentPage * LIMIT, total)} of {total} results
          </p>
          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Modals */}
      <AddTrainerModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        // onSuccess={handleRefresh}
        accessToken={accessToken}
      />
      <EditTrainerModal
        open={!!editTrainer}
        onClose={() => setEditTrainer(null)}
        onSuccess={handleRefresh}
        trainer={editTrainer}
        accessToken={accessToken}
      />
      <DeleteTrainerModal
        open={!!deleteTrainerId}
        onClose={() => {
          setDeleteTrainerId(null)
          setDeleteTrainerName('')
        }}
        onSuccess={handleRefresh}
        trainerId={deleteTrainerId}
        trainerName={deleteTrainerName}
        accessToken={accessToken}
      />
    </div>
  )
}

export default TrainersPage

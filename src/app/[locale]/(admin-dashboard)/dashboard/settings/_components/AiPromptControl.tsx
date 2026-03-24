/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { SystemSettings, MeasureType, CategoryType } from '@/types/settings'

import { useTranslations } from 'next-intl'

interface AiPromptControlProps {
  settings: SystemSettings | null
  onUpdate: () => void
}

type MeasurePromptRow = MeasureType & {
  categoryIndex: number
  measureIndex: number
  categoryName: string
}

const AiPromptControl = ({ settings, onUpdate }: AiPromptControlProps) => {
  const t = useTranslations('common')
  const { data: session } = useSession()
  const accessToken = session?.user?.accessToken
  const [isSubmitting, setIsSubmitting] = useState(false)

  const flattenCategoryMeasureTypes = (
    categories: CategoryType[] = [],
  ): MeasurePromptRow[] =>
    categories.flatMap((category, categoryIndex) =>
      (category.measureTypes || []).map((measureType, measureIndex) => ({
        ...measureType,
        categoryIndex,
        measureIndex,
        categoryName: category.labels?.en || category.name,
      })),
    )

  const { register, control, handleSubmit, reset } = useForm<{
    measureTypes: MeasurePromptRow[]
  }>({
    defaultValues: {
      measureTypes: [],
    },
  })

  const { fields } = useFieldArray({
    control,
    name: 'measureTypes',
  })

  // Sync with settings data when it loads
  useEffect(() => {
    if (settings?.categoryTypes) {
      reset({ measureTypes: flattenCategoryMeasureTypes(settings.categoryTypes) })
    }
  }, [settings, reset])

  const onSubmit = async (values: { measureTypes: MeasurePromptRow[] }) => {
    if (!settings?._id) return

    try {
      setIsSubmitting(true)
      const updatedCategoryTypes = (settings.categoryTypes || []).map(
        (category, categoryIndex) => ({
          ...category,
          measureTypes: (category.measureTypes || []).map(
            (measureType, measureIndex) => {
              const updatedMeasure = values.measureTypes.find(
                (item) =>
                  item.categoryIndex === categoryIndex &&
                  item.measureIndex === measureIndex,
              )

              return updatedMeasure
                ? {
                    ...measureType,
                    values: updatedMeasure.values,
                  }
                : measureType
            },
          ),
        }),
      )

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/system-setting/${settings._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            categoryTypes: updatedCategoryTypes,
          }),
        },
      )

      if (!res.ok) {
        throw new Error('Failed to update measure prompts')
      }

      toast.success('Measure prompts updated successfully!')
      onUpdate()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!fields || fields.length === 0) {
    return (
      <div className="py-10 text-center text-gray-400">
        {t('noMeasureTypesFound')}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="hidden overflow-hidden rounded-t-[12px] bg-[#00253E] text-white lg:block">
        <div className="grid grid-cols-[minmax(0,1fr)_260px_minmax(0,1fr)] border-b border-gray-700">
          <div className="px-6 py-4 text-center text-sm font-bold uppercase tracking-[0.18em] text-[#D0DDE8]">
            {t('german')}
          </div>
          <div className="px-6 py-4 text-center text-sm font-bold uppercase tracking-[0.18em]">
            {t('measuresPromptsHeader')}
          </div>
          <div className="px-6 py-4 text-center text-sm font-bold uppercase tracking-[0.18em] text-[#ECF2CB]">
            {t('english')}
          </div>
        </div>
      </div>

      <div className="w-full space-y-0">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px_minmax(0,1fr)] lg:gap-0"
          >
            {/* German Side */}
            <div className="flex min-h-[220px] flex-col bg-[#D0DDE8] p-4 lg:rounded-none lg:p-4">
              <span className="mb-2 ml-1 text-[12px] font-semibold uppercase text-[#00253E] opacity-60">
                {t('promptLabel')}
              </span>
              <Textarea
                {...register(`measureTypes.${index}.values.de`)}
                placeholder={t('germanPromptPlaceholder')}
                className="flex-1 resize-none rounded-[4px] border border-[#E2E8F0] bg-white p-4 text-[20px] font-normal leading-[110%] text-[#00253E] focus-visible:ring-0"
              />
            </div>

            {/* Middle Side */}
            <div className="order-first flex items-center justify-center lg:order-none">
              <div className="flex min-h-[92px] w-full max-w-[180px] flex-col items-center justify-center rounded-[10px] border border-[#BADA55] bg-[#BADA55] px-4 py-4 text-center shadow-[0_8px_18px_rgba(186,218,85,0.22)]">
                <span className="max-w-[130px] text-[18px] font-semibold leading-[1.08] text-[#00253E]">
                  {field.name}
                </span>
                <span className="mt-2 rounded-full border border-[#00253E]/10 bg-white/55 px-3 py-[5px] text-[10px] font-semibold uppercase tracking-[0.14em] text-[#00253E]/70">
                  {field.categoryName}
                </span>
              </div>
            </div>

            {/* English Side */}
            <div className="flex min-h-[220px] flex-col bg-[#ECF2CB] p-4 lg:rounded-none lg:p-4">
              <span className="mb-2 ml-1 text-[12px] font-semibold uppercase text-[#00253E] opacity-60">
                {t('promptLabel')}
              </span>
              <Textarea
                {...register(`measureTypes.${index}.values.en`)}
                placeholder={t('englishPromptPlaceholder')}
                className="flex-1 resize-none rounded-[4px] border border-[#E2E8F0] bg-white p-4 text-[20px] font-normal leading-[110%] text-[#00253E] focus-visible:ring-0"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary/90 text-[#00253E] font-bold px-10 h-11 rounded-[4px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('saving')}
            </>
          ) : (
            t('saveChanges')
          )}
        </Button>
      </div>
    </form>
  )
}

export default AiPromptControl

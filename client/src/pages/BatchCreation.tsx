import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/useToast"
import { Package, Search, Plus, CheckCircle } from "lucide-react"
import { searchAssemblies, getNextBCHNumber, createBatch } from "@/api/batch"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface BatchFormData {
  batchType: string
  assemblyType: string
  assemblyNumber: string
  productCode: string
  productDescription: string
  agNumber?: string
  note?: string
}

export function BatchCreation() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [assemblySearchOpen, setAssemblySearchOpen] = useState(false)
  const [assemblySearchQuery, setAssemblySearchQuery] = useState("")
  const [assemblyOptions, setAssemblyOptions] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid }
  } = useForm<BatchFormData>({
    mode: "onChange",
    defaultValues: {
      batchType: "",
      assemblyType: "",
      assemblyNumber: "",
      productCode: "",
      productDescription: "",
      agNumber: "",
      note: ""
    }
  })

  const watchedBatchType = watch("batchType")
  const watchedAssemblyNumber = watch("assemblyNumber")

  // Search assemblies when query changes
  useEffect(() => {
    if (assemblySearchQuery && watchedBatchType) {
      setIsSearching(true)
      searchAssemblies(assemblySearchQuery, watchedBatchType)
        .then((response: any) => {
          setAssemblyOptions(response.assemblies)
        })
        .catch((error) => {
          console.error("Error searching assemblies:", error)
          toast({
            title: "Search Error",
            description: "Failed to search assemblies",
            variant: "destructive"
          })
        })
        .finally(() => {
          setIsSearching(false)
        })
    }
  }, [assemblySearchQuery, watchedBatchType, toast])

  // Handle batch type change
  const handleBatchTypeChange = (value: string) => {
    setValue("batchType", value)
    setValue("assemblyNumber", "")
    setValue("productCode", "")
    setValue("productDescription", "")

    if (value === "Non-Unleashed") {
      // Get next BCH number
      getNextBCHNumber()
        .then((response: any) => {
          setValue("assemblyNumber", response.assemblyNumber)
        })
        .catch((error) => {
          console.error("Error getting BCH number:", error)
        })
    }
  }

  // Handle assembly selection
  const handleAssemblySelect = (assembly: any) => {
    setValue("assemblyNumber", assembly.assemblyNumber)
    setValue("productCode", assembly.productCode)
    setValue("productDescription", assembly.productDescription)
    setAssemblySearchOpen(false)
    setAssemblySearchQuery("")
  }

  const onSubmit = async (data: BatchFormData) => {
    console.log("Submitting batch creation:", data)
    setIsSubmitting(true)

    try {
      const response = await createBatch(data)
      console.log("Batch creation response:", response)

      toast({
        title: "Success",
        description: "Batch created successfully",
      })

      reset()
    } catch (error: any) {
      console.error("Batch creation error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create batch",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
          <Package className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
            Batch Creation
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Create new manufacturing batches with assembly numbers
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            New Batch Details
          </CardTitle>
          <CardDescription>
            Fill in the batch information. Required fields are marked with *
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Batch Type and Assembly Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="batchType">
                  Batch Type *
                </Label>
                <Select onValueChange={handleBatchTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Unleashed">Unleashed</SelectItem>
                    <SelectItem value="Non-Unleashed">Non-Unleashed</SelectItem>
                  </SelectContent>
                </Select>
                {errors.batchType && (
                  <p className="text-sm text-red-600">{errors.batchType.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="assemblyType">
                  Assembly Type *
                </Label>
                <Select onValueChange={(value) => setValue("assemblyType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assembly type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Main Assembly">Main Assembly</SelectItem>
                    <SelectItem value="Sub Assembly">Sub Assembly</SelectItem>
                  </SelectContent>
                </Select>
                {errors.assemblyType && (
                  <p className="text-sm text-red-600">{errors.assemblyType.message}</p>
                )}
              </div>
            </div>

            {/* Assembly Number Selection */}
            {watchedBatchType && (
              <div className="space-y-2">
                <Label htmlFor="assemblyNumber">
                  Assembly Number *
                </Label>
                {watchedBatchType === "Unleashed" ? (
                  <Popover open={assemblySearchOpen} onOpenChange={setAssemblySearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={assemblySearchOpen}
                        className="w-full justify-between"
                      >
                        {watchedAssemblyNumber || "Search assembly number..."}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search assembly number..."
                          value={assemblySearchQuery}
                          onValueChange={setAssemblySearchQuery}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {isSearching ? "Searching..." : "No assemblies found."}
                          </CommandEmpty>
                          <CommandGroup>
                            {assemblyOptions.map((assembly) => (
                              <CommandItem
                                key={assembly.assemblyNumber}
                                onSelect={() => handleAssemblySelect(assembly)}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">{assembly.assemblyNumber}</span>
                                  <span className="text-sm text-slate-500">
                                    {assembly.productDescription}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <Input
                    value={watchedAssemblyNumber}
                    readOnly
                    className="bg-slate-50"
                    placeholder="BCH number will be auto-generated"
                  />
                )}
              </div>
            )}

            {/* Auto-filled Product Information */}
            {watchedAssemblyNumber && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="productCode">Product Code</Label>
                  <Input
                    {...register("productCode")}
                    readOnly
                    className="bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productDescription">Product Description</Label>
                  <Input
                    {...register("productDescription")}
                    readOnly
                    className="bg-slate-50"
                  />
                </div>
              </div>
            )}

            {/* Optional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="agNumber">AG Number (Optional)</Label>
                <Input
                  {...register("agNumber")}
                  placeholder="Enter AG number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Note (Optional)</Label>
                <Textarea
                  {...register("note")}
                  placeholder="Enter any additional notes"
                  rows={3}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                disabled={isSubmitting}
              >
                Clear Form
              </Button>
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Create Batch
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
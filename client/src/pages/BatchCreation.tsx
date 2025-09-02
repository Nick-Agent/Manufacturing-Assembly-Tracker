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
import { Package, Search, Plus, CheckCircle, Info } from "lucide-react"
import { searchAssemblies, getNextBCHNumber, createBatch } from "@/api/batch"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface BatchFormData {
  batchType: string
  assemblyType: string
  assemblyNumber: string
  assemblyDate: string
  assembleBy: string
  status: string
  productCode: string
  productDescription: string
  sourceWarehouse: string
  destinationWarehouse: string
  auto: string
  assembledQuantity: string
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
  const [selectedAssembly, setSelectedAssembly] = useState<any>(null)

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
      assemblyDate: "",
      assembleBy: "",
      status: "",
      productCode: "",
      productDescription: "",
      sourceWarehouse: "",
      destinationWarehouse: "",
      auto: "",
      assembledQuantity: "",
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
    setValue("assemblyDate", "")
    setValue("assembleBy", "")
    setValue("status", "")
    setValue("productCode", "")
    setValue("productDescription", "")
    setValue("sourceWarehouse", "")
    setValue("destinationWarehouse", "")
    setValue("auto", "")
    setValue("assembledQuantity", "")
    setSelectedAssembly(null)

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
    setSelectedAssembly(assembly)
    setValue("assemblyNumber", assembly.assemblyNumber)
    setValue("assemblyDate", assembly.assemblyDate)
    setValue("assembleBy", assembly.assembleBy)
    setValue("status", assembly.status)
    setValue("productCode", assembly.productCode)
    setValue("productDescription", assembly.productDescription)
    setValue("sourceWarehouse", assembly.sourceWarehouse)
    setValue("destinationWarehouse", assembly.destinationWarehouse)
    setValue("auto", assembly.auto)
    setValue("assembledQuantity", assembly.assembledQuantity.toString())
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
      setSelectedAssembly(null)
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

  const isUnleashedType = watchedBatchType === "Unleashed"
  const isNonUnleashedType = watchedBatchType === "Non-Unleashed"

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
                {isUnleashedType ? (
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
                    {...register("assemblyNumber")}
                    readOnly={isNonUnleashedType}
                    className={isNonUnleashedType ? "bg-slate-50" : ""}
                    placeholder="BCH number will be auto-generated"
                  />
                )}
              </div>
            )}

            {/* Assembly Details Grid */}
            {watchedBatchType && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="assemblyDate">Assembly Date</Label>
                  <Input
                    {...register("assemblyDate")}
                    type="date"
                    readOnly={isUnleashedType}
                    className={isUnleashedType ? "bg-slate-50" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assembleBy">Assemble By</Label>
                  <Input
                    {...register("assembleBy")}
                    type="date"
                    readOnly={isUnleashedType}
                    className={isUnleashedType ? "bg-slate-50" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  {isUnleashedType ? (
                    <Input
                      {...register("status")}
                      readOnly
                      className="bg-slate-50"
                    />
                  ) : (
                    <Select onValueChange={(value) => setValue("status", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productCode">Product Code</Label>
                  <Input
                    {...register("productCode")}
                    placeholder="Enter product code"
                    readOnly={isUnleashedType}
                    className={isUnleashedType ? "bg-slate-50" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productDescription">Product Description</Label>
                  <Input
                    {...register("productDescription")}
                    placeholder="Enter product description"
                    readOnly={isUnleashedType}
                    className={isUnleashedType ? "bg-slate-50" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sourceWarehouse">Source Warehouse</Label>
                  <Input
                    {...register("sourceWarehouse")}
                    placeholder="Enter source warehouse"
                    readOnly={isUnleashedType}
                    className={isUnleashedType ? "bg-slate-50" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destinationWarehouse">Destination Warehouse</Label>
                  <Input
                    {...register("destinationWarehouse")}
                    placeholder="Enter destination warehouse"
                    readOnly={isUnleashedType}
                    className={isUnleashedType ? "bg-slate-50" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="auto">Auto</Label>
                  {isUnleashedType ? (
                    <Input
                      {...register("auto")}
                      readOnly
                      className="bg-slate-50"
                    />
                  ) : (
                    <Select onValueChange={(value) => setValue("auto", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select auto option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assembledQuantity">Assembled Quantity</Label>
                  <Input
                    {...register("assembledQuantity")}
                    type="number"
                    placeholder="Enter quantity"
                    readOnly={isUnleashedType}
                    className={isUnleashedType ? "bg-slate-50" : ""}
                  />
                </div>
              </div>
            )}

            {/* Assembly Information Display */}
            {selectedAssembly && isUnleashedType && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    Assembly Information (Auto-filled from UL_ASM)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Assembly Date</Label>
                      <p className="text-slate-800 font-medium">{selectedAssembly.assemblyDate}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Assemble By</Label>
                      <p className="text-slate-800 font-medium">{selectedAssembly.assembleBy}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Status</Label>
                      <Badge variant={selectedAssembly.status === 'Active' ? 'default' : 'secondary'}>
                        {selectedAssembly.status}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Product Code</Label>
                      <p className="text-slate-800 font-medium font-mono">{selectedAssembly.productCode}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Product Description</Label>
                      <p className="text-slate-800">{selectedAssembly.productDescription}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Source Warehouse</Label>
                      <p className="text-slate-800 font-mono">{selectedAssembly.sourceWarehouse}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Destination Warehouse</Label>
                      <p className="text-slate-800 font-mono">{selectedAssembly.destinationWarehouse}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Auto</Label>
                      <Badge variant={selectedAssembly.auto === 'Yes' ? 'default' : 'secondary'}>
                        {selectedAssembly.auto}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Assembled Quantity</Label>
                      <p className="text-slate-800 font-semibold">{selectedAssembly.assembledQuantity}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                onClick={() => {
                  reset()
                  setSelectedAssembly(null)
                }}
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
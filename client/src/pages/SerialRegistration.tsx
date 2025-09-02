import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/useToast"
import { Clipboard, Search, CheckCircle, Package, Info } from "lucide-react"
import { getBatchList } from "@/api/batch"
import { checkSerialExists, registerSerials } from "@/api/serial"
import { ModularSerialListScanner } from "@/components/ModularSerialListScanner"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface SerialRegistrationFormData {
  assemblyNumber: string
  productCode: string
  note?: string
}

export function SerialRegistration() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [batchSearchOpen, setBatchSearchOpen] = useState(false)
  const [batchOptions, setBatchOptions] = useState<any[]>([])
  const [serialNumbers, setSerialNumbers] = useState<string[]>([])
  const [selectedBatch, setSelectedBatch] = useState<any>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid }
  } = useForm<SerialRegistrationFormData>({
    mode: "onChange",
    defaultValues: {
      assemblyNumber: "",
      productCode: "",
      note: ""
    }
  })

  const watchedAssemblyNumber = watch("assemblyNumber")

  // Load batch list on component mount
  useEffect(() => {
    getBatchList()
      .then((response: any) => {
        setBatchOptions(response.batches)
      })
      .catch((error) => {
        console.error("Error loading batches:", error)
        toast({
          title: "Error",
          description: "Failed to load batch list",
          variant: "destructive"
        })
      })
  }, [toast])

  // Handle batch selection
  const handleBatchSelect = (batch: any) => {
    setSelectedBatch(batch)
    setValue("assemblyNumber", batch.assemblyNumber)
    setValue("productCode", batch.productCode)
    setBatchSearchOpen(false)
  }

  // Additional validation for serial scanner
  const validateSerial = async (serial: string, currentList: string[]): Promise<string | null> => {
    try {
      const response = await checkSerialExists(serial)
      if (response.exists) {
        return "Serial is already registered in the Serial_List database and cannot be added."
      }
      return null
    } catch (error) {
      console.error("Error validating serial:", error)
      return "Failed to validate serial number"
    }
  }

  const onSubmit = async (data: SerialRegistrationFormData) => {
    if (serialNumbers.length === 0) {
      toast({
        title: "Error",
        description: "Please scan at least one serial number",
        variant: "destructive"
      })
      return
    }

    console.log("Submitting serial registration:", { ...data, serialNumbers })
    setIsSubmitting(true)

    try {
      const response = await registerSerials({
        assemblyNumber: data.assemblyNumber,
        productCode: data.productCode,
        serialNumbers,
        note: data.note
      })

      console.log("Serial registration response:", response)

      toast({
        title: "Success",
        description: `Successfully registered ${serialNumbers.length} serial numbers`,
      })

      reset()
      setSerialNumbers([])
      setSelectedBatch(null)
    } catch (error: any) {
      console.error("Serial registration error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to register serial numbers",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = isValid && serialNumbers.length > 0 && watchedAssemblyNumber

  // Mock batch quantity data - in real app this would come from API
  const getBatchQuantityInfo = () => {
    if (!selectedBatch) return null
    
    // Mock data based on selected batch
    return {
      totalQuantity: 500,
      registeredQuantity: 247,
      outstanding: 253
    }
  }

  const quantityInfo = getBatchQuantityInfo()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
          <Clipboard className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
            Serial Registration
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Register serial numbers to existing batches
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Batch Selection & Serial Registration
          </CardTitle>
          <CardDescription>
            Select a batch and scan serial numbers to register
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Assembly Number Selection */}
            <div className="space-y-2">
              <Label htmlFor="assemblyNumber">
                Assembly Number *
              </Label>
              <Popover open={batchSearchOpen} onOpenChange={setBatchSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={batchSearchOpen}
                    className="w-full justify-between"
                  >
                    {watchedAssemblyNumber || "Select assembly number..."}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search assembly number..." />
                    <CommandList>
                      <CommandEmpty>No batches found.</CommandEmpty>
                      <CommandGroup>
                        {batchOptions.map((batch) => (
                          <CommandItem
                            key={batch.assemblyNumber}
                            onSelect={() => handleBatchSelect(batch)}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{batch.assemblyNumber}</span>
                              <span className="text-sm text-slate-500">
                                {batch.productDescription}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Batch Information Display */}
            {selectedBatch && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    Batch Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Product Code</Label>
                      <p className="text-lg font-semibold text-slate-800">{selectedBatch.productCode}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Product Description</Label>
                      <p className="text-slate-800">{selectedBatch.productDescription}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">AG Number</Label>
                      <p className="text-slate-800 font-mono">{selectedBatch.agNumber || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Quantity Information */}
                  {quantityInfo && (
                    <div className="border-t pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-white rounded-lg border border-slate-200">
                          <Label className="text-sm font-medium text-slate-600">Total Scanned</Label>
                          <p className="text-2xl font-bold text-blue-600">{serialNumbers.length}</p>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg border border-slate-200">
                          <Label className="text-sm font-medium text-slate-600">Quantity</Label>
                          <p className="text-2xl font-bold text-green-600">{quantityInfo.totalQuantity}</p>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg border border-slate-200">
                          <Label className="text-sm font-medium text-slate-600">Outstanding</Label>
                          <p className="text-2xl font-bold text-orange-600">{quantityInfo.outstanding}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Serial Number Scanner */}
            {selectedBatch && (
              <div className="space-y-2">
                <Label>Serial Numbers *</Label>
                <ModularSerialListScanner
                  onSerialsChange={setSerialNumbers}
                  additionalValidation={validateSerial}
                  placeholder="Scan or enter serial number..."
                />
              </div>
            )}

            {/* Optional Note */}
            <div className="space-y-2">
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea
                {...register("note")}
                placeholder="Enter any additional notes"
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset()
                  setSerialNumbers([])
                  setSelectedBatch(null)
                }}
                disabled={isSubmitting}
              >
                Clear Form
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Registering...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Register Serials ({serialNumbers.length})
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
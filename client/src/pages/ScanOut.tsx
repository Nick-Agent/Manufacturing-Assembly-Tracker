import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/useToast"
import { ScanLine, Package, CheckCircle } from "lucide-react"
import { submitScanOut } from "@/api/stock"
import { getProductSummary } from "@/api/serial"
import { ModularSerialListScanner } from "@/components/ModularSerialListScanner"

interface ScanOutFormData {
  scanOutTo: string
  note?: string
}

interface ProductSummary {
  productCode: string
  agNumber: string
  description: string
  count: number
}

export function ScanOut() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serialNumbers, setSerialNumbers] = useState<string[]>([])
  const [productSummary, setProductSummary] = useState<ProductSummary[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isValid }
  } = useForm<ScanOutFormData>({
    mode: "onChange",
    defaultValues: {
      scanOutTo: "",
      note: ""
    }
  })

  const watchedScanOutTo = watch("scanOutTo")

  // Load product summary when serials change
  useEffect(() => {
    if (serialNumbers.length > 0) {
      setIsLoadingProducts(true)
      getProductSummary(serialNumbers)
        .then((response: any) => {
          setProductSummary(response.products)
        })
        .catch((error) => {
          console.error("Error loading product summary:", error)
          setProductSummary([])
        })
        .finally(() => {
          setIsLoadingProducts(false)
        })
    } else {
      setProductSummary([])
    }
  }, [serialNumbers])

  const onSubmit = async (data: ScanOutFormData) => {
    if (serialNumbers.length === 0) {
      toast({
        title: "Error",
        description: "Please scan at least one serial number",
        variant: "destructive"
      })
      return
    }

    // Check if note is required for "other" option
    if (data.scanOutTo === "other" && !data.note?.trim()) {
      toast({
        title: "Error",
        description: "Note is required when selecting 'Other'",
        variant: "destructive"
      })
      return
    }

    console.log("Submitting scan OUT:", { ...data, serialNumbers })
    setIsSubmitting(true)

    try {
      const response = await submitScanOut({
        serialNumbers,
        scanOutTo: data.scanOutTo,
        note: data.note
      })

      console.log("Scan OUT response:", response)

      toast({
        title: "Success",
        description: `Successfully scanned OUT ${serialNumbers.length} serial(s)`,
      })

      reset()
      setSerialNumbers([])
      setProductSummary([])
    } catch (error: any) {
      console.error("Scan OUT error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to process scan OUT",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = isValid && serialNumbers.length > 0 && watchedScanOutTo
  const totalScannedCount = serialNumbers.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
          <ScanLine className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
            Scan OUT
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Scan serial numbers out of stock
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Stock OUT Operation
          </CardTitle>
          <CardDescription>
            Scan serial numbers and specify destination
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Serial Number Scanner */}
            <div className="space-y-2">
              <Label>Serial Numbers *</Label>
              <ModularSerialListScanner
                onSerialsChange={setSerialNumbers}
                placeholder="Scan or enter serial number..."
              />
            </div>

            {/* Product Summary Table */}
            {serialNumbers.length > 0 && (
              <Card className="bg-slate-50 border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Product Summary</span>
                    <span className="text-sm font-normal text-slate-600">
                      Total Scanned: {totalScannedCount}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingProducts ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-600" />
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-100">
                            <TableHead>Product Code</TableHead>
                            <TableHead>AG Number</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Count</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {productSummary.map((product, index) => (
                            <TableRow key={index} className="hover:bg-slate-50">
                              <TableCell className="font-mono font-medium">
                                {product.productCode}
                              </TableCell>
                              <TableCell className="font-mono">
                                {product.agNumber}
                              </TableCell>
                              <TableCell>{product.description}</TableCell>
                              <TableCell className="text-right font-semibold">
                                {product.count}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Scan Out To Selection */}
            <div className="space-y-2">
              <Label htmlFor="scanOutTo">
                Scan OUT To *
              </Label>
              <Select onValueChange={(value) => setValue("scanOutTo", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Production Fault">Production Fault</SelectItem>
                  <SelectItem value="VIC Service Fault">VIC Service Fault</SelectItem>
                  <SelectItem value="QLD Service Fault">QLD Service Fault</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.scanOutTo && (
                <p className="text-sm text-red-600">{errors.scanOutTo.message}</p>
              )}
            </div>

            {/* Note Field */}
            <div className="space-y-2">
              <Label htmlFor="note">
                Note {watchedScanOutTo === "other" && <span className="text-red-500">*</span>}
              </Label>
              <Textarea
                {...register("note", {
                  required: watchedScanOutTo === "other" ? "Note is required when selecting 'Other'" : false
                })}
                placeholder={watchedScanOutTo === "other" ? "Please specify the destination..." : "Enter any additional notes"}
                rows={3}
              />
              {errors.note && (
                <p className="text-sm text-red-600">{errors.note.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset()
                  setSerialNumbers([])
                  setProductSummary([])
                }}
                disabled={isSubmitting}
              >
                Clear Form
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Scan OUT ({serialNumbers.length})
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
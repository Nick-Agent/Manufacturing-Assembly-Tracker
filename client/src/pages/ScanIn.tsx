import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/useToast"
import { ScanLine, Package, CheckCircle } from "lucide-react"
import { submitScanIn } from "@/api/stock"
import { getSerialDetails } from "@/api/serial"
import { getTestDocument } from "@/api/test"
import { ModularSerialListScanner } from "@/components/ModularSerialListScanner"

interface ScanInFormData {
  scanInTo: string
  note?: string
}

export function ScanIn() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serialNumbers, setSerialNumbers] = useState<string[]>([])
  const [productInfo, setProductInfo] = useState<any>(null)
  const [testDocument, setTestDocument] = useState<any>(null)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isValid }
  } = useForm<ScanInFormData>({
    mode: "onChange",
    defaultValues: {
      scanInTo: "",
      note: ""
    }
  })

  const watchedScanInTo = watch("scanInTo")

  // Load product info when first serial is scanned
  useEffect(() => {
    if (serialNumbers.length > 0) {
      getSerialDetails(serialNumbers[0])
        .then((response: any) => {
          setProductInfo(response.serial)
          // Load test document
          getTestDocument(response.serial.productCode)
            .then((docResponse: any) => {
              setTestDocument(docResponse.document)
            })
            .catch((error) => {
              console.error("Error loading test document:", error)
            })
        })
        .catch((error) => {
          console.error("Error loading product info:", error)
        })
    } else {
      setProductInfo(null)
      setTestDocument(null)
    }
  }, [serialNumbers])

  const onSubmit = async (data: ScanInFormData) => {
    if (serialNumbers.length === 0) {
      toast({
        title: "Error",
        description: "Please scan at least one serial number",
        variant: "destructive"
      })
      return
    }

    // Check if note is required for "other" option
    if (data.scanInTo === "other" && !data.note?.trim()) {
      toast({
        title: "Error",
        description: "Note is required when selecting 'Other'",
        variant: "destructive"
      })
      return
    }

    console.log("Submitting scan IN:", { ...data, serialNumbers })
    setIsSubmitting(true)

    try {
      const response = await submitScanIn({
        serialNumbers,
        scanInTo: data.scanInTo,
        note: data.note
      })

      console.log("Scan IN response:", response)

      toast({
        title: "Success",
        description: `Successfully scanned IN ${serialNumbers.length} serial(s)`,
      })

      reset()
      setSerialNumbers([])
      setProductInfo(null)
      setTestDocument(null)
    } catch (error: any) {
      console.error("Scan IN error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to process scan IN",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = isValid && serialNumbers.length > 0 && watchedScanInTo

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
          <ScanLine className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
            Scan IN
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Scan serial numbers into stock
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Stock IN Operation
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

            {/* Product Information Display */}
            {productInfo && (
              <Card className="bg-slate-50 border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Product Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Product Code</Label>
                      <p className="text-lg font-semibold text-slate-800">{productInfo.productCode}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Serial Count</Label>
                      <p className="text-lg font-semibold text-slate-800">
                        {serialNumbers.length} serial{serialNumbers.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Test Document Information */}
            {testDocument && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Test Document Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Document Description</Label>
                      <p className="text-slate-800">{testDocument.documentDescription}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Document Number</Label>
                      <p className="text-slate-800 font-mono">{testDocument.documentNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Version</Label>
                      <p className="text-slate-800">{testDocument.version}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Type</Label>
                      <Badge variant="secondary">{testDocument.type}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Scan In To Selection */}
            <div className="space-y-2">
              <Label htmlFor="scanInTo">
                Scan IN To *
              </Label>
              <Select onValueChange={(value) => setValue("scanInTo", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PCBL Complete">PCBL Complete</SelectItem>
                  <SelectItem value="Service Repair">Service Repair</SelectItem>
                  <SelectItem value="Return">Return</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.scanInTo && (
                <p className="text-sm text-red-600">{errors.scanInTo.message}</p>
              )}
            </div>

            {/* Note Field */}
            <div className="space-y-2">
              <Label htmlFor="note">
                Note {watchedScanInTo === "other" && <span className="text-red-500">*</span>}
              </Label>
              <Textarea
                {...register("note", {
                  required: watchedScanInTo === "other" ? "Note is required when selecting 'Other'" : false
                })}
                placeholder={watchedScanInTo === "other" ? "Please specify the destination..." : "Enter any additional notes"}
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
                  setProductInfo(null)
                  setTestDocument(null)
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
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Scan IN ({serialNumbers.length})
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
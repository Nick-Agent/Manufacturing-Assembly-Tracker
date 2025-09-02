import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/useToast"
import { CheckCircle, TestTube, FileText, User } from "lucide-react"
import { validateSerialsProductCode } from "@/api/serial"
import { getTestDocument, submitTestPass } from "@/api/test"
import { ModularSerialListScanner } from "@/components/ModularSerialListScanner"

interface TestPassFormData {
  note?: string
}

export function TestLogPass() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serialNumbers, setSerialNumbers] = useState<string[]>([])
  const [productCode, setProductCode] = useState<string>("")
  const [testDocument, setTestDocument] = useState<any>(null)
  const [technicianInfo, setTechnicianInfo] = useState<any>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<TestPassFormData>({
    defaultValues: {
      note: ""
    }
  })

  // Validate serials have same product code when serials change
  useEffect(() => {
    if (serialNumbers.length > 0) {
      validateSerialsProductCode(serialNumbers)
        .then((response: any) => {
          if (response.valid) {
            setProductCode(response.productCode)
            // Load test document for this product code
            getTestDocument(response.productCode)
              .then((docResponse: any) => {
                setTestDocument(docResponse.document)
              })
              .catch((error) => {
                console.error("Error loading test document:", error)
              })
            
            // Mock technician info - in real app this would come from auth context or API
            setTechnicianInfo({
              technician: "John Smith",
              agNumber: "AG-2024-001"
            })
          }
        })
        .catch((error) => {
          console.error("Error validating serials:", error)
          toast({
            title: "Validation Error",
            description: "Failed to validate serial numbers",
            variant: "destructive"
          })
        })
    } else {
      setProductCode("")
      setTestDocument(null)
      setTechnicianInfo(null)
    }
  }, [serialNumbers, toast])

  // Additional validation for serial scanner
  const validateSerial = async (serial: string, currentList: string[]): Promise<string | null> => {
    // Check if all serials have same product code
    const testList = [...currentList, serial]
    try {
      const response = await validateSerialsProductCode(testList)
      if (!response.valid) {
        return "All serial numbers must have the same Product Code."
      }
      return null
    } catch (error) {
      console.error("Error validating serial:", error)
      return "Failed to validate serial number"
    }
  }

  const onSubmit = async (data: TestPassFormData) => {
    if (serialNumbers.length === 0) {
      toast({
        title: "Error",
        description: "Please scan at least one serial number",
        variant: "destructive"
      })
      return
    }

    if (!testDocument) {
      toast({
        title: "Error",
        description: "Test document information not loaded",
        variant: "destructive"
      })
      return
    }

    console.log("Submitting test PASS:", { serialNumbers, productCode, testDocument, ...data })
    setIsSubmitting(true)

    try {
      const response = await submitTestPass({
        serialNumbers,
        productCode,
        documentNumber: testDocument.documentNumber,
        note: data.note
      })

      console.log("Test PASS response:", response)

      toast({
        title: "Success",
        description: `Successfully recorded PASS result for ${serialNumbers.length} serial(s)`,
      })

      reset()
      setSerialNumbers([])
      setProductCode("")
      setTestDocument(null)
      setTechnicianInfo(null)
    } catch (error: any) {
      console.error("Test PASS error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to record test result",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = serialNumbers.length > 0 && productCode && testDocument

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
          <CheckCircle className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
            Test Log (PASS)
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Record successful test results for serial numbers
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Test Result Entry
          </CardTitle>
          <CardDescription>
            Scan serial numbers and record PASS test results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Serial Number Scanner */}
            <div className="space-y-2">
              <Label>Serial Numbers *</Label>
              <ModularSerialListScanner
                onSerialsChange={setSerialNumbers}
                additionalValidation={validateSerial}
                placeholder="Scan or enter serial number..."
              />
            </div>

            {/* Technician and AG Number Information */}
            {technicianInfo && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-green-600" />
                    Technician Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Technician</Label>
                      <p className="text-lg font-semibold text-slate-800">{technicianInfo.technician}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">AG Number</Label>
                      <p className="text-lg font-semibold text-slate-800">{technicianInfo.agNumber}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Product Information Display */}
            {productCode && (
              <Card className="bg-slate-50 border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Product Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Product Code</Label>
                      <p className="text-lg font-semibold text-slate-800">{productCode}</p>
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
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Test Document Details
                  </CardTitle>
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

            {/* Optional Note */}
            <div className="space-y-2">
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea
                {...register("note")}
                placeholder="Enter any additional notes about the test"
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
                  setProductCode("")
                  setTestDocument(null)
                  setTechnicianInfo(null)
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
                    Recording...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Record PASS ({serialNumbers.length})
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
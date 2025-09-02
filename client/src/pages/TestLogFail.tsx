import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/useToast"
import { XCircle, TestTube, FileText, AlertTriangle, User } from "lucide-react"
import { getSerialDetails } from "@/api/serial"
import { getTestDocument, submitTestFail } from "@/api/test"

interface TestFailFormData {
  serialNumber: string
  faultEntry: string
}

export function TestLogFail() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serialDetails, setSerialDetails] = useState<any>(null)
  const [testDocument, setTestDocument] = useState<any>(null)
  const [technicianInfo, setTechnicianInfo] = useState<any>(null)
  const [isLoadingSerial, setIsLoadingSerial] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid }
  } = useForm<TestFailFormData>({
    mode: "onChange",
    defaultValues: {
      serialNumber: "",
      faultEntry: ""
    }
  })

  const watchedSerialNumber = watch("serialNumber")

  // Load serial details when serial number changes
  useEffect(() => {
    if (watchedSerialNumber && watchedSerialNumber.length > 3) {
      setIsLoadingSerial(true)
      getSerialDetails(watchedSerialNumber)
        .then((response: any) => {
          setSerialDetails(response.serial)
          // Load test document for this product code
          getTestDocument(response.serial.productCode)
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
        })
        .catch((error) => {
          console.error("Error loading serial details:", error)
          setSerialDetails(null)
          setTestDocument(null)
          setTechnicianInfo(null)
        })
        .finally(() => {
          setIsLoadingSerial(false)
        })
    } else {
      setSerialDetails(null)
      setTestDocument(null)
      setTechnicianInfo(null)
    }
  }, [watchedSerialNumber])

  const onSubmit = async (data: TestFailFormData) => {
    if (!serialDetails || !testDocument) {
      toast({
        title: "Error",
        description: "Serial or test document information not loaded",
        variant: "destructive"
      })
      return
    }

    console.log("Submitting test FAIL:", { ...data, serialDetails, testDocument })
    setIsSubmitting(true)

    try {
      const response = await submitTestFail({
        serialNumber: data.serialNumber,
        productCode: serialDetails.productCode,
        documentNumber: testDocument.documentNumber,
        faultEntry: data.faultEntry
      })

      console.log("Test FAIL response:", response)

      toast({
        title: "Success",
        description: "Successfully recorded FAIL result",
      })

      reset()
      setSerialDetails(null)
      setTestDocument(null)
      setTechnicianInfo(null)
    } catch (error: any) {
      console.error("Test FAIL error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to record test result",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = isValid && serialDetails && testDocument

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 flex items-center justify-center">
          <XCircle className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
            Test Log (FAIL)
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Record failed test results with fault details
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Test Failure Entry
          </CardTitle>
          <CardDescription>
            Enter serial number and fault details for failed test
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Serial Number Input */}
            <div className="space-y-2">
              <Label htmlFor="serialNumber">
                Serial Number *
              </Label>
              <div className="relative">
                <Input
                  {...register("serialNumber", {
                    required: "Serial number is required"
                  })}
                  placeholder="Enter or scan serial number"
                  className="text-lg h-12"
                />
                {isLoadingSerial && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-600" />
                  </div>
                )}
              </div>
              {errors.serialNumber && (
                <p className="text-sm text-red-600">{errors.serialNumber.message}</p>
              )}
            </div>

            {/* Technician and AG Number Information */}
            {technicianInfo && (
              <Card className="bg-red-50 border-red-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-red-600" />
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

            {/* Serial Details Display */}
            {serialDetails && (
              <Card className="bg-slate-50 border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Serial Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Product Code</Label>
                      <p className="text-lg font-semibold text-slate-800">{serialDetails.productCode}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Product Description</Label>
                      <p className="text-slate-800">{serialDetails.productDescription}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Current Status</Label>
                      <Badge variant="secondary">{serialDetails.status}</Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Location</Label>
                      <p className="text-slate-800">{serialDetails.location}</p>
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

            {/* Fault Entry - Required Field */}
            <div className="space-y-2">
              <Label htmlFor="faultEntry">
                Fault Entry *
              </Label>
              <Textarea
                {...register("faultEntry", {
                  required: "Fault entry is required for failed tests"
                })}
                placeholder="Describe the fault or failure details..."
                rows={4}
                className="resize-none"
              />
              {errors.faultEntry && (
                <p className="text-sm text-red-600">{errors.faultEntry.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset()
                  setSerialDetails(null)
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
                className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Recording...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Record FAIL
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
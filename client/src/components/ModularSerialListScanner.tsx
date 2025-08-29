import { useState, useRef, useEffect } from "react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { ScrollArea } from "./ui/scroll-area"
import { X, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "./ui/alert"
import { Badge } from "./ui/badge"

interface ModularSerialListScannerProps {
  onSerialsChange: (serials: string[]) => void
  additionalValidation?: (serial: string, currentList: string[]) => Promise<string | null>
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function ModularSerialListScanner({
  onSerialsChange,
  additionalValidation,
  disabled = false,
  placeholder = "Scan or enter serial number...",
  className = ""
}: ModularSerialListScannerProps) {
  const [currentInput, setCurrentInput] = useState("")
  const [serialList, setSerialList] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    onSerialsChange(serialList)
  }, [serialList, onSerialsChange])

  const validateSerial = async (serial: string): Promise<string | null> => {
    // Basic validation - check for duplicates in current list
    if (serialList.includes(serial)) {
      return "Serial is already in the current list."
    }

    // Additional validation if provided
    if (additionalValidation) {
      return await additionalValidation(serial, serialList)
    }

    return null
  }

  const handleInputChange = (value: string) => {
    setCurrentInput(value)
    if (error) {
      setError(null)
    }
  }

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentInput.trim()) {
      e.preventDefault()
      await addSerial(currentInput.trim())
    }
  }

  const handlePaste = async (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    const lines = pastedText.split(/\r?\n/).filter(line => line.trim())
    
    for (const line of lines) {
      const serial = line.trim()
      if (serial) {
        const validationError = await validateSerial(serial)
        if (validationError) {
          setError(validationError)
          return
        }
      }
    }

    // If all validations pass, add all serials
    const validSerials = lines.map(line => line.trim()).filter(Boolean)
    setSerialList(prev => [
      ...validSerials.reverse(), // Latest entries at top
      ...prev
    ])
    setCurrentInput("")
    
    // Focus back to input
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const addSerial = async (serial: string) => {
    if (!serial || disabled) return

    setIsValidating(true)
    
    try {
      const validationError = await validateSerial(serial)
      
      if (validationError) {
        setError(validationError)
        setIsValidating(false)
        return
      }

      // Add serial to list (latest at top)
      setSerialList(prev => [serial, ...prev])
      setCurrentInput("")
      setError(null)
      
      // Keep focus on input
      setTimeout(() => inputRef.current?.focus(), 0)
    } catch (err) {
      setError("Validation failed. Please try again.")
    } finally {
      setIsValidating(false)
    }
  }

  const removeSerial = (index: number) => {
    setSerialList(prev => prev.filter((_, i) => i !== index))
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const clearAll = () => {
    setSerialList([])
    setCurrentInput("")
    setError(null)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const dismissError = () => {
    setError(null)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Input Section */}
      <div className="space-y-2">
        <Input
          ref={inputRef}
          value={currentInput}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          disabled={disabled || isValidating || !!error}
          className="text-lg h-12"
        />
        
        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={dismissError}
                className="h-6 px-2 text-red-600 hover:text-red-700"
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Serial List Display */}
      {serialList.length > 0 && (
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Scanned Serials
                <Badge variant="secondary" className="ml-2">
                  {serialList.length}
                </Badge>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-40 w-full">
              <div className="space-y-2">
                {serialList.map((serial, index) => (
                  <div
                    key={`${serial}-${index}`}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <span className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300">
                      {serial}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSerial(index)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
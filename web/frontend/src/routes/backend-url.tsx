import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getBaseUrl, setBaseUrl } from "@/lib/api-config"
import { createFileRoute } from "@tanstack/react-router"
import type React from "react"
import { useState } from "react"

export const Route = createFileRoute("/backend-url")({
  component: BackendUrlPage,
})

function BackendUrlPage() {
  const [url, setUrl] = useState(getBaseUrl())

  const handleSave = () => {
    setBaseUrl(url)
    // Optional: reload the page or navigate away so the new URL takes effect globally
    window.location.href = "/"
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Backend Configuration" />
      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="mx-auto flex max-w-2xl flex-col gap-6">
          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Custom Backend URL</h2>
            <p className="text-muted-foreground mb-6 text-sm">
              If you are hosting PicoClaw on a remote server or a different port, specify the base URL here. Leave it blank to use the default relative paths.
            </p>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2">
                <label htmlFor="backend-url" className="text-sm font-medium leading-none">
                  Backend API URL
                </label>
                <Input
                  id="backend-url"
                  placeholder="e.g. http://192.168.1.100:8080"
                  value={url}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                />
              </div>
              <Button onClick={handleSave} className="w-full sm:w-auto">
                Save URL
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

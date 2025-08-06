'use client'

import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Clock, RefreshCw, Wifi, WifiOff, Server, Database, Brain } from 'lucide-react'

interface ServiceStatus {
  timestamp: string
  overall: 'healthy' | 'degraded' | 'error' | 'unknown'
  services: {
    [key: string]: {
      status: 'healthy' | 'error'
      details?: any
      endpoint?: string
      error?: string
    }
  }
  dependencies: {
    [key: string]: {
      status: 'healthy' | 'error'
      details?: any
      issues?: string[]
    }
  }
  recommendations: string[]
}

interface NetworkRequest {
  id: string
  timestamp: string
  method: string
  url: string
  status: number | null
  duration: number
  error?: string
  response?: any
}

export default function ServiceHealthMonitor({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [healthStatus, setHealthStatus] = useState<ServiceStatus | null>(null)
  const [networkRequests, setNetworkRequests] = useState<NetworkRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)

  // Intercept fetch requests to monitor network activity
  useEffect(() => {
    if (!isOpen) return

    const originalFetch = window.fetch
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
      const startTime = Date.now()
      const url = typeof input === 'string' ? input : input.toString()
      const method = init?.method || 'GET'
      
      console.log(`🌐 [${requestId}] ${method} ${url}`)
      
      try {
        const response = await originalFetch(input, init)
        const duration = Date.now() - startTime
        
        // Clone response to read it without affecting the original
        const responseClone = response.clone()
        let responseData = null
        
        try {
          responseData = await responseClone.json()
        } catch {
          // Response is not JSON, that's okay
        }
        
        const networkRequest: NetworkRequest = {
          id: requestId,
          timestamp: new Date().toLocaleTimeString(),
          method,
          url,
          status: response.status,
          duration,
          response: responseData
        }
        
        setNetworkRequests(prev => [networkRequest, ...prev.slice(0, 19)]) // Keep last 20 requests
        console.log(`✅ [${requestId}] ${response.status} ${method} ${url} (${duration}ms)`)
        
        return response
      } catch (error) {
        const duration = Date.now() - startTime
        const networkRequest: NetworkRequest = {
          id: requestId,
          timestamp: new Date().toLocaleTimeString(),
          method,
          url,
          status: null,
          duration,
          error: error instanceof Error ? error.message : 'Network error'
        }
        
        setNetworkRequests(prev => [networkRequest, ...prev.slice(0, 19)])
        console.error(`❌ [${requestId}] ${method} ${url} failed:`, error)
        throw error
      }
    }
    
    return () => {
      window.fetch = originalFetch
    }
  }, [isOpen])

  const checkHealth = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/debug/service-health')
      const data = await response.json()
      setHealthStatus(data)
    } catch (error) {
      console.error('Health check failed:', error)
      setHealthStatus({
        timestamp: new Date().toISOString(),
        overall: 'error',
        services: {},
        dependencies: {},
        recommendations: ['Failed to connect to health check endpoint']
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      checkHealth()
    }
  }, [isOpen])

  useEffect(() => {
    if (autoRefresh && isOpen) {
      const interval = setInterval(checkHealth, 10000) // Refresh every 10 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh, isOpen])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'degraded': return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: number | null) => {
    if (status === null) return 'text-red-500'
    if (status >= 200 && status < 300) return 'text-green-500'
    if (status >= 400) return 'text-red-500'
    return 'text-yellow-500'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Server className="h-5 w-5" />
              Service Health Monitor
            </h2>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                Auto-refresh
              </label>
              <button
                onClick={checkHealth}
                disabled={isLoading}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Refresh'}
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Overall Status */}
          {healthStatus && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(healthStatus.overall)}
                <h3 className="font-medium">Overall Status: {healthStatus.overall.toUpperCase()}</h3>
                <span className="text-sm text-gray-500">
                  Last checked: {new Date(healthStatus.timestamp).toLocaleTimeString()}
                </span>
              </div>
              
              {healthStatus.recommendations.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-2">
                  <h4 className="font-medium text-yellow-800 mb-1">Recommendations:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {healthStatus.recommendations.map((rec, i) => (
                      <li key={i}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Services Status */}
          {healthStatus && (
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Services
                </h3>
                <div className="space-y-2">
                  {Object.entries(healthStatus.services).map(([name, service]) => (
                    <div key={name} className="border rounded p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium capitalize">{name.replace('_', ' ')}</span>
                        {getStatusIcon(service.status)}
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>Endpoint: {service.endpoint}</div>
                        {service.error && <div className="text-red-600">Error: {service.error}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Dependencies
                </h3>
                <div className="space-y-2">
                  {Object.entries(healthStatus.dependencies).map(([name, dep]) => (
                    <div key={name} className="border rounded p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium capitalize">{name}</span>
                        {getStatusIcon(dep.status)}
                      </div>
                      {dep.issues && dep.issues.length > 0 && (
                        <div className="text-sm text-red-600">
                          {dep.issues.map((issue, i) => (
                            <div key={i}>• {issue}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Network Requests */}
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              Live Network Requests
            </h3>
            <div className="border rounded">
              <div className="bg-gray-50 px-3 py-2 text-sm font-medium border-b">
                Recent API Calls
              </div>
              <div className="max-h-60 overflow-y-auto">
                {networkRequests.length === 0 ? (
                  <div className="p-3 text-gray-500 text-center">No network requests captured yet</div>
                ) : (
                  networkRequests.map((req) => (
                    <div key={req.id} className="border-b last:border-b-0 p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {req.method}
                        </span>
                        <span className={`font-medium ${getStatusColor(req.status)}`}>
                          {req.status || 'FAILED'}
                        </span>
                        <span className="text-gray-500">{req.duration}ms</span>
                        <span className="text-gray-500">{req.timestamp}</span>
                      </div>
                      <div className="mt-1 text-gray-600 break-all">{req.url}</div>
                      {req.error && (
                        <div className="mt-1 text-red-600 text-xs">{req.error}</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
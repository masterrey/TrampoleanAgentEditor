import { useState, useCallback } from 'react'
import { AIMode, AIRequest, AIResponse, AITask } from '@/types'
import { v4 as uuidv4 } from 'uuid'
import toast from 'react-hot-toast'

export function useAI() {
  const [tasks, setTasks] = useState<AITask[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentTask, setCurrentTask] = useState<AITask | null>(null)

  const processAI = useCallback(async (request: AIRequest): Promise<AIResponse | null> => {
    const task: AITask = {
      id: uuidv4(),
      status: 'pending',
      mode: request.mode,
      request,
      createdAt: new Date(),
    }

    setTasks((prev) => [...prev, task])
    setCurrentTask(task)
    setIsLoading(true)

    try {
      task.status = 'running'
      setCurrentTask({ ...task })

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'AI request failed')
      }

      const result: AIResponse = await response.json()

      task.status = 'completed'
      task.response = result
      task.completedAt = new Date()

      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...task } : t))
      )
      setCurrentTask({ ...task })
      toast.success(`AI ${request.mode.toLowerCase()} completed!`)

      return result
    } catch (error) {
      task.status = 'failed'
      task.error = error instanceof Error ? error.message : 'Unknown error'
      task.completedAt = new Date()

      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...task } : t))
      )
      setCurrentTask({ ...task })
      toast.error(`AI ${request.mode.toLowerCase()} failed: ${task.error}`)

      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearTasks = useCallback(() => {
    setTasks([])
    setCurrentTask(null)
  }, [])

  return {
    tasks,
    isLoading,
    currentTask,
    processAI,
    clearTasks,
  }
}

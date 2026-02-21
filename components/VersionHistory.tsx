'use client'

import { DocumentVersion } from '@/types'

interface VersionHistoryProps {
  versions: DocumentVersion[]
  onRestore: (version: DocumentVersion) => void
  onClose: () => void
}

export default function VersionHistory({ versions, onRestore, onClose }: VersionHistoryProps) {
  const sortedVersions = [...versions].sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            📜 Version History
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {sortedVersions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No versions saved yet
            </p>
          ) : (
            <div className="space-y-2">
              {sortedVersions.map((version) => (
                <div
                  key={version.id}
                  className="p-3 border border-gray-200 dark:border-gray-700 rounded hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {version.description || 'Auto-save'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(version.savedAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => onRestore(version)}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors"
                    >
                      Restore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

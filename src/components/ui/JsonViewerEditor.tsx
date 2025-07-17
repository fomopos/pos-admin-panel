import React, { useState, useCallback, useEffect } from 'react';
import AceEditor from 'react-ace';
import { SparklesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// Import ACE modes and themes
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/ext-language_tools';

interface JsonViewerEditorProps {
  value: string;
  onChange: (value: string) => void;
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  className?: string;
  isFullScreen?: boolean;
  readOnly?: boolean;
  showActionsInHeader?: boolean;
}

const JsonViewerEditor: React.FC<JsonViewerEditorProps> = ({
  value,
  onChange,
  title,
  icon: Icon,
  className = '',
  isFullScreen = false,
  readOnly = false,
  showActionsInHeader = false
}) => {
  const [editValue, setEditValue] = useState(value);

  // Parse JSON safely and get error details
  const parseJsonWithError = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      return { success: true, data: parsed, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid JSON';
      return { success: false, data: null, error: errorMessage };
    }
  }, []);

  // Validate JSON and extract error line/column
  const getJsonErrorDetails = useCallback((jsonString: string) => {
    try {
      JSON.parse(jsonString);
      return null;
    } catch (error) {
      if (error instanceof SyntaxError) {
        const message = error.message;
        // Try to extract line and column information
        const lineMatch = message.match(/line (\d+)/i);
        const columnMatch = message.match(/column (\d+)/i);
        const positionMatch = message.match(/position (\d+)/i);
        
        return {
          message,
          line: lineMatch ? parseInt(lineMatch[1]) - 1 : 0,
          column: columnMatch ? parseInt(columnMatch[1]) - 1 : 0,
          position: positionMatch ? parseInt(positionMatch[1]) : 0
        };
      }
      return { message: error instanceof Error ? error.message : 'Invalid JSON', line: 0, column: 0, position: 0 };
    }
  }, []);

  // Handle ACE editor changes
  const handleAceEditorChange = useCallback((newValue: string) => {
    setEditValue(newValue);
    if (!readOnly) {
      // Validate JSON in real-time
      parseJsonWithError(newValue);
      // Auto-save changes (debounced in parent component)
      onChange(newValue);
    }
  }, [onChange, parseJsonWithError, readOnly]);

  // Format JSON
  const handleFormatJson = useCallback(() => {
    try {
      const parsed = JSON.parse(editValue);
      const formatted = JSON.stringify(parsed, null, 2);
      setEditValue(formatted);
      if (!readOnly) {
        onChange(formatted);
      }
    } catch (error) {
      // If parsing fails, keep the current value
    }
  }, [editValue, onChange, readOnly]);

  // Minify JSON
  const handleMinifyJson = useCallback(() => {
    try {
      const parsed = JSON.parse(editValue);
      const minified = JSON.stringify(parsed);
      setEditValue(minified);
      if (!readOnly) {
        onChange(minified);
      }
    } catch (error) {
      // If parsing fails, keep the current value
    }
  }, [editValue, onChange, readOnly]);

  // Update edit value when prop value changes
  useEffect(() => {
    setEditValue(value);
    parseJsonWithError(value);
  }, [value, parseJsonWithError]);

  const { success: jsonValid } = parseJsonWithError(editValue);
  const errorDetails = getJsonErrorDetails(editValue);

  return (
    <div className={`bg-white shadow rounded-lg ${isFullScreen ? 'flex-1 flex flex-col h-full' : ''} ${className}`}>
      <div className={`px-3 py-3 ${isFullScreen ? 'flex-1 flex flex-col h-full' : ''} ${className.includes('h-full') ? 'h-full flex flex-col' : ''}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base leading-6 font-medium text-gray-900 flex items-center">
            <Icon className="h-4 w-4 mr-2" />
            {title}
          </h3>
          <div className="flex items-center space-x-3">
            {/* Line and character count */}
            <div className="text-xs text-gray-500">
              {editValue.split('\n').length} lines, {editValue.length} characters
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              jsonValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {jsonValid ? 'Valid JSON' : 'Invalid JSON'}
            </span>
            {/* Format/Minify buttons in header */}
            {showActionsInHeader && !readOnly && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleFormatJson}
                  disabled={!jsonValid}
                  className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SparklesIcon className="h-3 w-3 mr-1 inline" />
                  Format
                </button>
                <button
                  onClick={handleMinifyJson}
                  disabled={!jsonValid}
                  className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Minify
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {errorDetails && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-medium text-red-800">JSON Syntax Error</h4>
                <p className="text-xs text-red-700 mt-1">{errorDetails.message}</p>
                {errorDetails.line > 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    Line {errorDetails.line + 1}, Column {errorDetails.column + 1}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className={`${isFullScreen ? 'flex-1' : ''} ${className.includes('h-full') ? 'flex-1' : ''}`}>
          <div className={`${isFullScreen ? 'h-full flex flex-col' : ''} ${className.includes('h-full') ? 'h-full flex flex-col' : ''}`}>
            <div className={`${isFullScreen ? 'flex-1' : ''} ${className.includes('h-full') ? 'flex-1' : ''}`}>
              <AceEditor
                mode="json"
                theme="github"
                value={editValue}
                onChange={handleAceEditorChange}
                fontSize={12}
                showPrintMargin={false}
                showGutter={true}
                highlightActiveLine={true}
                readOnly={readOnly}
                width="100%"
                height={isFullScreen || className.includes('h-full') ? '100%' : '384px'}
                setOptions={{
                  enableBasicAutocompletion: true,
                  enableLiveAutocompletion: true,
                  enableSnippets: false,
                  showLineNumbers: true,
                  tabSize: 2,
                  wrap: true,
                  useWorker: false
                }}
                annotations={errorDetails ? [{
                  row: errorDetails.line,
                  column: errorDetails.column,
                  text: errorDetails.message,
                  type: 'error'
                }] : []}
              />
            </div>
            {!readOnly && !showActionsInHeader && (
              <div className="flex items-center justify-start mt-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleFormatJson}
                    disabled={!jsonValid}
                    className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <SparklesIcon className="h-3 w-3 mr-1 inline" />
                    Format
                  </button>
                  <button
                    onClick={handleMinifyJson}
                    disabled={!jsonValid}
                    className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Minify
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JsonViewerEditor;

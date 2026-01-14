import { useState } from 'react'
import axios from 'axios'
import Editor from 'react-simple-code-editor'
import { highlight, languages } from 'prismjs/components/prism-core'
import 'prismjs/components/prism-python'
import 'prismjs/themes/prism-tomorrow.css' // Better dark theme for Prism

function App() {
  const [code, setCode] = useState('print("System ready.\\nInitiating launch sequence...")')
  const [output, setOutput] = useState('')
  const [status, setStatus] = useState('IDLE') // IDLE, QUEUED, PROCESSING, COMPLETED, FAILED
  const [loading, setLoading] = useState(false)

  const runCode = async () => {
    setLoading(true)
    setOutput('')
    setStatus('QUEUED')

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/execute/', { source_code: code })
      const taskId = res.data.task_id
      setStatus('PROCESSING')

      const intervalId = setInterval(async () => {
        try {
          const statusRes = await axios.get(`http://127.0.0.1:8000/api/status/${taskId}/`)
          const { status, result } = statusRes.data

          if (status === 'SUCCESS' || status === 'FAILURE') {
            clearInterval(intervalId)
            setLoading(false)
            
            if (result.status === 'Success') {
              setStatus('COMPLETED')
              setOutput(result.output)
            } else {
              setStatus('FAILED')
              setOutput(result.output || 'Unknown Runtime Error')
            }
          }
        } catch (err) {
          clearInterval(intervalId)
          setLoading(false)
          setStatus('FAILED')
          setOutput('Network Error: Could not reach status endpoint.')
        }
      }, 1000)

    } catch (err) {
      setLoading(false)
      setStatus('FAILED')
      setOutput('Submission Error: Could not connect to API.')
    }
  }

  // Helper to determine status badge color
  const getStatusColor = () => {
    switch (status) {
      case 'PROCESSING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'COMPLETED': return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'FAILED': return 'bg-red-500/20 text-red-400 border-red-500/50'
      default: return 'bg-slate-700/50 text-slate-400 border-slate-600'
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-mono flex flex-col">
      
      {/* Navbar / Header */}
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <h1 className="ml-4 text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            THE_EXECUTIONER // <span className="text-slate-500 text-sm font-normal">EXECUTION_ENGINE v1.0</span>
          </h1>
        </div>
        
        <div className={`px-3 py-1 rounded-full border text-xs font-bold tracking-wider transition-all duration-300 ${getStatusColor()}`}>
          ● STATUS: {status}
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[500px]">
        
        {/* LEFT: Code Editor */}
        <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/5">
          {/* Editor Header */}
          <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span className="text-sm text-slate-400">solution.py</span>
            </div>
            
            <button 
              onClick={runCode} 
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all duration-200 
                ${loading 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]'
                }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  EXECUTING...
                </>
              ) : (
                'RUN CODE'
              )}
            </button>
          </div>

          {/* Editor Area */}
          <div className="flex-1 overflow-auto relative bg-[#1e1e1e]">
            <Editor
              value={code}
              onValueChange={code => setCode(code)}
              highlight={code => highlight(code, languages.python)}
              padding={24}
              className="font-mono text-sm leading-relaxed"
              style={{
                fontFamily: '"Fira Code", monospace',
                fontSize: 14,
                minHeight: '100%',
              }}
              textareaClassName="focus:outline-none"
            />
          </div>
        </div>

        {/* RIGHT: Terminal Output */}
        <div className="flex flex-col bg-black border border-slate-800 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/5 relative group">
          {/* Scanline Effect */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
          
          {/* Terminal Header */}
          <div className="bg-slate-900/50 border-b border-slate-800 px-4 py-3 flex items-center justify-between backdrop-blur-sm">
            <span className="text-xs uppercase tracking-widest text-slate-500">Terminal Output</span>
            <div className="flex gap-1.5">
               <div className="w-2 h-2 rounded-full bg-slate-700"></div>
               <div className="w-2 h-2 rounded-full bg-slate-700"></div>
            </div>
          </div>

          {/* Terminal Body */}
          <div className="flex-1 p-6 font-mono text-sm overflow-auto">
            {status === 'IDLE' && (
              <div className="text-slate-600 flex flex-col items-center justify-center h-full gap-2 opacity-50">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <p>Waiting for input...</p>
              </div>
            )}

            {output && (
               <div className="animate-in fade-in duration-300">
                 <span className="text-green-500 mr-2">➜</span>
                 <span className="text-slate-400">root@judge:~#</span>
                 <span className="text-slate-200 ml-2">./script.py</span>
                 <div className="mt-4 pb-2 border-b border-slate-800/50"></div>
                 <pre className={`mt-4 whitespace-pre-wrap ${status === 'FAILED' ? 'text-red-400' : 'text-cyan-300'}`}>
                   {output}
                 </pre>
                 {status === 'COMPLETED' && (
                   <div className="mt-4 text-slate-600 text-xs">
                     Process exited with code 0
                   </div>
                 )}
               </div>
            )}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full mt-8 text-center text-slate-600 text-xs">
        <p>SECURE SANDBOX ENVIRONMENT // DOCKER ISOLATED // REDIS QUEUE</p>
      </footer>
    </div>
  )
}

export default App
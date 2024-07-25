import { useState } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'

const ERROR_API_KEY = '[GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent: [400 ] API key not valid. Please pass a valid API key. [{"@type":"type.googleapis.com/google.rpc.ErrorInfo","reason":"API_KEY_INVALID","domain":"googleapis.com","metadata":{"service":"generativelanguage.googleapis.com"}}]'

export default function App () {
  const [error, setError] = useState('')
  const [value, setValue] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')

  const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

  const getResponse = () => {
    if (!value) {
      setError('¡Error! ¡Porfavor haz una pregunta!')
      return
    }

    if (!genAI) {
      setError('¡Error! ¡Porfavor ingrese su apikey de gemini!')
      return
    }

    setLoading(true)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 100
      }
    })

    const msg = value

    chat.sendMessage(msg)
      .then(result => result.response)
      .then(response => response.text())
      .then(data => {
        console.log(data)
        console.log('peticion')
        setChatHistory(prevChatHistory => {
          // Check if the new message already exists in chatHistory
          const isDuplicate = prevChatHistory.some(
            entry => entry.role === 'user' && entry.parts[0].text === value
          )

          if (!isDuplicate) {
            return [
              ...prevChatHistory,
              { role: 'user', parts: [{ text: value }] },
              { role: 'model', parts: [{ text: data }] }
            ]
          }

          // If it's a duplicate, return the original chatHistory
          return prevChatHistory
        })
        setValue('')
      })
      .catch((err) => {
        if (err.message === ERROR_API_KEY) {
          setError('ERROR! API_KEY inválida! Porfavor ingrese un válida')
        } else {
          console.log(err.message)
          setError('ERROR! Algo salió mal :(')
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <div className='app'>
      <div className='header'>
        <h1>GEMINI CHAT</h1><span className='by'>By Sebastian Peñaloza</span>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
        }}
        className='input-container apikey'
      >
        <input
          className='apikey'
          type='text'
          value={apiKey}
          placeholder='Ingresa tu apikey...'
          onChange={e => {
            setApiKey(e.target.value)
          }}
        />
      </form>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          getResponse()
        }}
        className='input-container'
      >
        <input
          type='text'
          value={value}
          placeholder='Chatea con gemini...'
          onChange={(e) => setValue(e.target.value)}
        />
        <button onClick={() => setError('')}>Enviar</button>
      </form>
      {error && <p className='danger'>{error}</p>}
      <div className='search-result'>
        {
            chatHistory.length
              ? chatHistory.reverse().map(element => (
                <div key={crypto.randomUUID()}>
                  <p className='answer'><strong>{element.role === 'model' ? 'gemini' : 'usuario'}</strong>{`: ${element.parts[0].text}`}</p>
                </div>
              ))
              : null
        }
      </div>
      {loading && <h2>Cargando respuesta.. </h2>}
    </div>
  )
}

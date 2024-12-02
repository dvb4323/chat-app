import { createServer } from 'http'

import { app } from './app'

const httpServer = createServer(app)

const PORT = process.env.PORT || 3000
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default httpServer
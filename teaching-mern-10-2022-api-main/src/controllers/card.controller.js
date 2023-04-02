import { HttpStatusCode } from '*/utilities/constants'
import { CardService } from '*/services/card.service'

const createNew = async (req, res) => {
  try {
    const result = await CardService.createNew(req.body)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      errors: error.message
    })
  }
}

const update = async (req, res) => {
  try {
    const cardId = req.params.id
    const userInfo = req.jwtDecoded
    const cardCoverFile = req.file
    const result = await CardService.update(cardId, req.body, userInfo, cardCoverFile)

    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      errors: error.message
    })
  }
}

export const CardController = {
  createNew,
  update
}

import express from 'express'
import { InvitationController } from '*/controllers/invitation.controller'
import { InvitationValidation } from '*/validations/invitation.validation'
import { AuthMiddleware } from '*/middlewares/auth.middleware'

const router = express.Router()

// Create board invitation
router.route('/board')
  .post(AuthMiddleware.isAuthorized, InvitationValidation.createNewBoardInvitation, InvitationController.createNewBoardInvitation)

// Get invitations
router.route('/')
  .get(AuthMiddleware.isAuthorized, InvitationController.getInvitations)

router.route('/board/:invitationId')
  .put(AuthMiddleware.isAuthorized, InvitationController.updateBoardInvitation)

export const invitationRoutes = router



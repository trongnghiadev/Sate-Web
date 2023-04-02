import React, { useEffect, useState } from 'react'
import './AppBar.scss'
import { Container as BootstrapContainer, Row, Col, InputGroup, FormControl, Form, Dropdown, Button, Badge } from 'react-bootstrap'
import Logo from 'resources/images/LogoState.png'
import UserAvatar from 'components/Common/UserAvatar'

import { useSelector, useDispatch } from 'react-redux'
import { selectCurrentUser, signOutUserAPI } from 'redux/user/userSlice'
import { Link, useNavigate } from 'react-router-dom'
import {
  fetchInvitationsAPI,
  selectCurrentNotifications,
  updateBoardInvitationAPI,
  addNotification
} from 'redux/notifications/notificationsSlice'
import { isEmpty } from 'lodash'
import moment from 'moment'
import { socketIoInstance } from 'index'

function AppBar() {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const notifications = useSelector(selectCurrentNotifications)
  const navigate = useNavigate()
  const [newNotif, setNewNotif] = useState(false)

  useEffect(() => {
    dispatch(fetchInvitationsAPI())

    socketIoInstance.on('s_user_invited_to_board', (invitation) => {
      if (invitation.inviteeId === user._id) {
        // Thêm cái bản ghi invitation mới vào redux
        dispatch(addNotification(invitation))

        // Cập nhật trạng thái là đang có thông báo đến
        setNewNotif(true)
      }
    })

  }, [dispatch, user._id])

  const updateBoardInvitation = (action, notification) => {
    dispatch(updateBoardInvitationAPI({
      action: action,
      notificationId: notification._id
    })).then((res) => {
      if (res.payload.boardInvitation.status === 'ACCEPTED') {
        navigate(`/b/${res.payload.boardInvitation.boardId}`)
      }
    })
  }

  return (
    <nav className="navbar-app">
      <BootstrapContainer className="trongnghia-trello-container">
        <Row>
          <Col md={5} sm={6} xs={12} className="col-no-padding">
            <div className="app-actions">
              <div className="item all"><i className="fa fa-th" /></div>
              <div className="item home"><i className="fa fa-home" /></div>
              <div className="item boards">
                <Link to={`/u/${user?.username}/boards?currentPage=1`}>
                  <i className="fa fa-columns" />&nbsp;&nbsp;<strong>Boards</strong>
                </Link>
              </div>
              <div className="item search">
                <Form className="common__form">
                  <InputGroup className="group-search">
                    <FormControl
                      className="input-search"
                      placeholder="Jump to..."
                    />
                    <InputGroup.Text className="input-icon-search"><i className="fa fa-search" /></InputGroup.Text>
                  </InputGroup>
                </Form>
              </div>
            </div>
          </Col>
          <Col md={2} sm={2} xs={12} className="col-no-padding">
            <div className="app-branding text-center">
              <a href="#" target="blank">
                <img src={Logo} className="top-logo" alt="Sate-logo" />
                <span className="trongnghia-slogan">State Web</span>
              </a>
            </div>
          </Col>
          <Col md={5} sm={4} xs={12} className="col-no-padding">
            <div className="user-actions">
              <div className="item quick"><i className="fa fa-plus-square-o" /></div>
              <div className="item news"><i className="fa fa-info-circle" /></div>

              <div className="item notification">
                <div className='common-dropdown'>
                  <Dropdown autoClose="outside">
                    <div onClick={() => setNewNotif(false)}>
                      <Dropdown.Toggle id="dropdown-basic" size="sm">
                        <i className={`fa fa-bell icon ${newNotif ? 'ring': ''}`} />
                      </Dropdown.Toggle>
                    </div>

                    <Dropdown.Menu>
                      <div className="notification__item__header">
                        Notifications
                      </div>

                      <div className="notification__item__wrapper">
                        {isEmpty(notifications) &&
                          <Dropdown.Item className="notification__item">
                            <div className="notification__item__content">
                              You have no new notification!
                            </div>
                          </Dropdown.Item>
                        }

                        {notifications?.map((n, index) => {
                          if (n.type === 'BOARD_INVITATION') {
                            return (
                              <Dropdown.Item className="notification__item" key={index}>
                                <div className="notification__item__content">
                                  <strong>{n?.inviter?.displayName}</strong>
                                  &nbsp;had invited you to join the board:&nbsp;
                                  <strong>{n?.board?.title}</strong>
                                </div>

                                {n?.boardInvitation?.status === 'PENDING' &&
                                  <div className="notification__item__actions">
                                    <Button
                                      variant="success" type="button" size="sm" className="px-4"
                                      onClick={() => updateBoardInvitation('accept', n)}
                                    >
                                      Accept
                                    </Button>
                                    <Button
                                      variant="secondary"type="button" size="sm" className="px-4"
                                      onClick={() => updateBoardInvitation('reject', n)}
                                    >
                                      Reject
                                    </Button>
                                  </div>
                                }

                                {n?.boardInvitation?.status === 'ACCEPTED' &&
                                  <div className="notification__item__actions">
                                    <Badge bg="success">Accepted</Badge>
                                  </div>
                                }

                                {n?.boardInvitation?.status === 'REJECTED' &&
                                  <div className="notification__item__actions">
                                    <Badge bg="secondary">Rejected</Badge>
                                  </div>
                                }

                                <div className="notification__item__actions">
                                  <Badge bg="info">{n.createdAt && moment(n.createdAt).format('llll')}</Badge>
                                </div>
                              </Dropdown.Item>
                            )
                          }
                        })}
                      </div>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>

              <div className="item user-avatar">
                <div className='common-dropdown'>
                  <Dropdown>
                    <Dropdown.Toggle id="dropdown-basic" size="sm">
                      <UserAvatar user={user} tooltip='day la avatar' />
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item
                        as={Link}
                        to={`/u/${user?.username}?tab=account`}
                        className="account tqd-send">
                        <i className="icon fa fa-user" />Account
                      </Dropdown.Item>

                      <Dropdown.Item
                        as={Link}
                        to={`/u/${user?.username}?tab=settings`}
                        className="settings tqd-send">
                        <i className="icon fa fa-cog" />Settings
                      </Dropdown.Item>

                      <Dropdown.Item
                        as={Link}
                        to={`/u/${user?.username}?tab=help`}
                        className="help tqd-send">
                        <i className="icon fa fa-question-circle" />Help
                      </Dropdown.Item>

                      <Dropdown.Item
                        onClick={() => dispatch(signOutUserAPI())}
                        className="sign-out tqd-send">
                        <i className="icon danger fa fa-sign-out" />Sign out
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </BootstrapContainer>
    </nav>
  )
}

export default AppBar

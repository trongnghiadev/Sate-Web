import React, { useEffect, useState } from 'react'
import UserAvatar from 'components/Common/UserAvatar'
import { USER_SELECT_POPOVER_TYPE_CARD_MEMBERS } from 'utilities/constants'
import { cloneDeep } from 'lodash'

function UserSelectPopover({ label, users=[], type, cardMemberIds, beforeUpdateCardMembers }) {
  const [showPopover, setShowPopover] = useState(false)
  const [remakeUsers, setRemakeUsers] = useState([])

  useEffect(() => {
    if (Array.isArray(users) && Array.isArray(cardMemberIds) && type === USER_SELECT_POPOVER_TYPE_CARD_MEMBERS) {
      let newRemakeUsers = cloneDeep(users)
      newRemakeUsers.forEach(u => {
        if (cardMemberIds.includes(u._id)) {
          u['selected'] = true
        }
      })
      setRemakeUsers(newRemakeUsers)
    } else {
      setRemakeUsers(users)
    }
  }, [cardMemberIds, type, users])

  const toggleShowPopOver = () => {
    setShowPopover(!showPopover)
  }

  const handleClickUser = (user) => {
    if (type === USER_SELECT_POPOVER_TYPE_CARD_MEMBERS) {
      let action = 'CARD_MEMBERS_ACTION_PUSH'
      if (user.selected) action = 'CARD_MEMBERS_ACTION_REMOVE'

      beforeUpdateCardMembers(user._id, action)
    }
  }

  return (
    <div className="users__select">
      <div className="users__select__content" onClick={toggleShowPopOver}>
        {label ? label : <i className="fa fa-plus" />}
      </div>
      {showPopover &&
        <div className="users__select__popover">
          <span className="users__select__popover__close_btn" onClick={toggleShowPopOver}>
            <i className="fa fa-close" />
          </span>
          <div className="title mb-2 text-center">Board members</div>
          <div className="users-list">
            {remakeUsers.map((u, index) => (
              <div
                className={`user ${u.selected ? 'selected' : ''}`}
                key={index}
                onClick={() => handleClickUser(u)}
              >
                <UserAvatar
                  user={u}
                  width="28px"
                  height="28px"
                  fontSize="14px"
                />
              </div>
            ))}
          </div>
        </div>
      }
    </div>
  )
}

export default UserSelectPopover

import React, { useState, useEffect, useRef } from 'react'
import { flushSync } from 'react-dom'
import { Container } from 'react-smooth-dnd'
import {
  Container as BootstrapContainer,
  Row, Col, Form, Button
} from 'react-bootstrap'
import { isEmpty, cloneDeep, isEqual } from 'lodash'

import './BoardContent.scss'
import ListColumns from 'components/ListColumns/ListColumns'
import { applyDrag } from 'utilities/dragDrop'
import {
  createNewColumnAPI,
  updateBoardAPI,
  updateColumnAPI,
  updateCardAPI
} from 'actions/ApiCall'
import { useSelector, useDispatch } from 'react-redux'
import {
  updateCurrentFullBoard,
  fetchFullBoardDetailsAPI,
  selectCurrentFullBoard
} from 'redux/activeBoard/activeBoardSlice'
import { useParams } from 'react-router-dom'

function BoardContent() {
  const dispatch = useDispatch()

  const board = useSelector(selectCurrentFullBoard)

  // const [board, setBoard] = useState({})
  const [columns, setColumns] = useState([])
  const [openNewColumnForm, setOpenNewColumnForm] = useState(false)
  const toggleOpenNewColumnForm = () => setOpenNewColumnForm(!openNewColumnForm)

  const newColumnInputRef = useRef(null)

  const [newColumnTitle, setNewColumnTitle] = useState('')
  const onNewColumnTitleChange = (e) => setNewColumnTitle(e.target.value)

  const { boardId } = useParams()

  useEffect(() => {
    dispatch(fetchFullBoardDetailsAPI(boardId))
  }, [dispatch, boardId])

  useEffect(() => {
    if (board) {
      setColumns(board.columns)
    }
  }, [board])

  useEffect(() => {
    if (newColumnInputRef && newColumnInputRef.current) {
      newColumnInputRef.current.focus()
      newColumnInputRef.current.select()
    }
  }, [openNewColumnForm])

  if (isEmpty(board)) {
    return <div className="not-found" style={{ 'padding': '10px', 'color': 'white' }}>Board not found!</div>
  }

  const onColumnDrop = (dropResult) => {
    // CloneDeep columns ra một biến originalColumns
    // Mục đích dùng trong trường hợp gọi API bị lỗi thì set lại giá trị columns về ban đầu (trong phần catch phía dưới)
    const originalColumns = cloneDeep(columns)

    // Clone một biến newColumns bằng Spread Operator (cú pháp dấu 3 chấm) để xử lý tính toán sắp xếp vị trí mới của column
    let newColumns = [...columns]
    newColumns = applyDrag(newColumns, dropResult)

    // CloneDeep board ra một biến originalBoard
    // Mục đích dùng trong trường hợp gọi API bị lỗi thì set lại giá trị board về ban đầu (trong phần catch phía dưới)
    const originalBoard = cloneDeep(board)

    // Clone một biến newBoard bằng Spread Operator (cú pháp dấu 3 chấm) để cập nhật lại 2 mảng columnOrder và columns cho đúng thứ tự mới.
    let newBoard = { ...board }
    newBoard.columnOrder = newColumns.map(c => c._id)
    newBoard.columns = newColumns

    // Nếu trường hợp người dùng kéo thả column về vị trí ban đầu của chính nó thì return luôn, không làm gì, đỡ phải request API tốn tài nguyên
    if (isEqual(originalBoard.columnOrder, newBoard.columnOrder)) {
      return false
    }

    // Cập nhật 2 giá trị mới newColumns và newBoard vào State trước khi gọi API (để giao diện trông mượt khi kéo thả, khônng phải chờ đợi việc gọi API)
    flushSync(() => setColumns(newColumns))
    flushSync(() => dispatch(updateCurrentFullBoard(newBoard)))

    // Call api update columnOrder in board details.
    updateBoardAPI(newBoard._id, newBoard)
      .catch(() => {
        // Nếu gọi API lỗi thì set lại giá trị về ban đầu.
        flushSync(() => setColumns(originalColumns))
        flushSync(() => dispatch(updateCurrentFullBoard(originalBoard)))
      })
  }

  const onCardDrop = (columnId, dropResult) => {
    if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
      // Mục đích của originalColumns và newColumn tương tự như đã comment ở hàm onColumnDrop ngay phía trên
      const originalColumns = cloneDeep(columns)
      let newColumns = [...columns]

      let currentColumn = newColumns.find(c => c._id === columnId)
      if (!currentColumn) return
      // https://redux-toolkit.js.org/usage/immer-reducers
      // Vì thằng currentColumn hiện tại nó là dữ liệu lấy ra từ newColumns, mà newColumns là lấy ra từ redux
      // Redux nó không cho Mutating (đột biến) trực tiếp dữ liệu kiểu Object.data = '123' ở bên ngoài scope của Reducer
      // Nên chúng ta sẽ cần clone cái curentColumn ra thành một Object khác để tính toán ghi đè lại dữ liệu mới vào thằng newColumns
      const newCards = applyDrag(currentColumn.cards, dropResult)
      const newCardOrder = newCards.map(i => i._id)
      const newCurrentColumn = {
        ...currentColumn,
        cards: newCards,
        cardOrder: newCardOrder
      }

      // Tiếp theo sẽ dùng Array.splice để ghi đè/thay thế đúng thằng column hiện tại vào vị trí của nó trong cái newColumns (từ Redux Store)
      const currentColumnIndex = newColumns.findIndex(column => column._id === columnId)
      newColumns.splice(currentColumnIndex, 1, newCurrentColumn)

      // currentColumn.cards = applyDrag(currentColumn.cards, dropResult)
      // currentColumn.cardOrder = currentColumn.cards.map(i => i._id)


      // Mục đích của originalBoard và newBoard tương tự như đã comment ở hàm onColumnDrop ngay phía trên
      const originalBoard = cloneDeep(board)
      let newBoard = { ...board }
      newBoard.columnOrder = newColumns.map(c => c._id)
      newBoard.columns = newColumns

      /**
       * Phải sử dụng flushSync() vì cái tính năng Automatic batching mới trong react 18,
       *  link docs ngay bên dưới
       * Automatic batching for fewer renders in React 18
       * https://github.com/reactwg/react-18/discussions/21
       */
      flushSync(() => setColumns(newColumns))
      flushSync(() => dispatch(updateCurrentFullBoard(newBoard)))
      if (dropResult.removedIndex !== null && dropResult.addedIndex !== null) {
        /**
         * Hành động di chuyển card trong column hiện tại
         * 1 - Gọi API để cập nhật lại giá trị cardOrder trong cái column hiện tại
         */
        updateColumnAPI(newCurrentColumn._id, newCurrentColumn)
          .catch(() => {
            flushSync(() => setColumns(originalColumns))
            flushSync(() => dispatch(updateCurrentFullBoard(originalBoard)))
          })
      } else {
        /**
         * Hành động di chuyển card giữa 2 columns khác nhay
         */
        // 1 - Gọi API để cập nhật lại giá trị cardOrder trong cái column hiện tại
        updateColumnAPI(newCurrentColumn._id, newCurrentColumn)
          .catch(() => {
            flushSync(() => setColumns(originalColumns))
            flushSync(() => dispatch(updateCurrentFullBoard(originalBoard)))
          })

        if (dropResult.addedIndex !== null) {
          let currentCard = cloneDeep(dropResult.payload)
          currentCard.columnId = newCurrentColumn._id
          // 2 - Gọi API để cập nhật giá trị columnId mới cho card sau khi nó được di chuyển qua column mới
          updateCardAPI(currentCard._id, currentCard)
        }
      }
    }
  }

  const addNewColumn = () => {
    if (!newColumnTitle) {
      newColumnInputRef.current.focus()
      return
    }

    const newColumnToAdd = {
      boardId: board._id,
      title: newColumnTitle.trim()
    }
    // Call API
    createNewColumnAPI(newColumnToAdd).then(column => {
      let newColumns = [...columns]
      newColumns.push(column)

      let newBoard = { ...board }
      newBoard.columnOrder = newColumns.map(c => c._id)
      newBoard.columns = newColumns

      setColumns(newColumns)
      dispatch(updateCurrentFullBoard(newBoard))

      setNewColumnTitle('')
      toggleOpenNewColumnForm()
    })
  }

  const onUpdateColumnState = (newColumnToUpdate) => {
    const columnIdToUpdate = newColumnToUpdate._id

    let newColumns = [...columns]
    const columnIndexToUpdate = newColumns.findIndex(i => i._id === columnIdToUpdate)

    if (newColumnToUpdate._destroy) {
      // remove column
      newColumns.splice(columnIndexToUpdate, 1)
    } else {
      // update column info
      newColumns.splice(columnIndexToUpdate, 1, newColumnToUpdate)
    }

    let newBoard = { ...board }
    newBoard.columnOrder = newColumns.map(c => c._id)
    newBoard.columns = newColumns

    setColumns(newColumns)
    dispatch(updateCurrentFullBoard(newBoard))
  }

  return (
    <div className="board-content">
      <Container
        orientation="horizontal"
        onDrop={onColumnDrop}
        getChildPayload={index => columns[index]}
        dragHandleSelector=".column-drag-handle"
        dropPlaceholder={{
          animationDuration: 150,
          showOnTop: true,
          className: 'column-drop-preview'
        }}
      >
        <ListColumns
          columns={columns}
          onCardDrop={onCardDrop}
          onUpdateColumnState={onUpdateColumnState}
        />
      </Container>

      <BootstrapContainer className="trongnghia-trello-container">
        {!openNewColumnForm &&
          <Row>
            <Col className="add-new-column" onClick={toggleOpenNewColumnForm}>
              <i className="fa fa-plus icon" /> Add another column
            </Col>
          </Row>
        }
        {openNewColumnForm &&
          <Row>
            <Col className="enter-new-column">
              <Form className="common__form">
                <Form.Control
                  size="sm"
                  type="text"
                  placeholder="Enter column title..."
                  className="input-enter-new-column"
                  ref={newColumnInputRef}
                  value={newColumnTitle}
                  onChange={onNewColumnTitleChange}
                  onKeyDown={event => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      addNewColumn()
                    }
                  }}
                />
                <Button variant="success" size="sm" onClick={addNewColumn}>Add column</Button>
                <span className="cancel-icon" onClick={toggleOpenNewColumnForm}>
                  <i className="fa fa-trash icon" />
                </span>
              </Form>
            </Col>
          </Row>
        }
      </BootstrapContainer>
    </div>
  )
}

export default BoardContent

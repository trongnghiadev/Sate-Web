import React, { useEffect, useState } from 'react'
import { createSearchParams, useSearchParams, Link } from 'react-router-dom'
import {
  Container as BootstrapContainer,
  Row, Col, ListGroup, Card, Form
} from 'react-bootstrap'
import CustomPagination from 'components/Common/Pagination'
import './Boards.scss'
import CreateNewBoardModal from './CreateNewBoardModal'
import { fetchBoardsAPI, createNewBoardAPI } from 'actions/ApiCall'
import LoadingSpinner from 'components/Common/LoadingSpinner'
import { isEmpty } from 'lodash'
import { useDebounce } from 'customHooks/useDebounce'

function Boards () {
  const [showCreateBoardModal, setShowCreateBoardModal] = useState(false)
  const [boards, setBoards] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const [totalBoards, setTotalBoards] = useState(null)

  useEffect(() => {
    const searchPath = `?${createSearchParams(searchParams)}`

    fetchBoardsAPI(searchPath).then(res => {
      setBoards(res.boards)
      setTotalBoards(res.totalBoards)
    })
  }, [searchParams])

  const onPageChange = (selectedPage, itemsPerPage) => {
    setSearchParams({
      ...Object.fromEntries([...searchParams]), // lấy đúng toàn bộ những params hiện tại trên URL
      // Sau đó bên dưới là mới cập nhật/ghi đè dữ liệu mới
      currentPage: selectedPage,
      itemsPerPage: itemsPerPage
    })
  }

  const debounceSearchBoard = useDebounce(
    (event) => {
      const searchTerm = event.target?.value
      setSearchParams({
        ...Object.fromEntries([...searchParams]), // lấy đúng toàn bộ những params hiện tại trên URL
        // Sau đó bên dưới là mới cập nhật/ghi đè dữ liệu mới
        'q[title]': searchTerm
        // 'q[description]': 'desc'
      })
    },
    1000
  )

  const createNewBoard = async (boardData) => {
    try {
      // Gọi api tạo mới 1 board
      await createNewBoardAPI(boardData)

      // fetch lại danh sách board khi đã tạo thành công 1 cái board
      const searchPath = `?${createSearchParams(searchParams)}`
      const res = await fetchBoardsAPI(searchPath)
      setBoards(res.boards)
      setTotalBoards(res.totalBoards)

      return true
    } catch (error) {
      return error
    }
  }

  return (
    <BootstrapContainer>
      <CreateNewBoardModal
        show={showCreateBoardModal}
        onClose={() => setShowCreateBoardModal(false)}
        onCreateNewBoard={createNewBoard}
      />
      <Row>
        <Col md={3} className="mt-5">
          <div className="boards__navigation">
            <div className="boards__heading">Navigation</div>
            <ListGroup variant="flush" className="boards__menu">
              <ListGroup.Item action active><i className="fa fa-columns icon" /> Boards</ListGroup.Item>
              <ListGroup.Item action><i className="fa fa-globe icon" /> Templates</ListGroup.Item>
              <ListGroup.Item action><i className="fa fa-home icon" /> Home</ListGroup.Item>
              <hr/>
              <ListGroup.Item action variant="success" onClick={() => setShowCreateBoardModal(true)}>
                <i className="fa fa-plus-square-o icon" /> Create new board
              </ListGroup.Item>
              <hr/>
              <ListGroup.Item className="p-0">
                <Form className="common__form">
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="Search boards..."
                    onChange={debounceSearchBoard}
                  />
                </Form>
              </ListGroup.Item>
            </ListGroup>
          </div>
        </Col>
        <Col md={9} className="mt-5">
          {!boards
            ? <LoadingSpinner caption="Loading boards..." />
            : isEmpty(boards)
              ? <div>No boards</div>
              : <>
                <div className="grid__boards">
                  <div className="boards__heading">Your boards:</div>
                  <Row xs={1} md={2} lg={3} className="g-4">
                    {boards.map(b => (
                      <Col key={b._id}>
                        <Card as={Link} to={`/b/${b._id}`} className="text-decoration-none">
                          <Card.Body>
                            <Card.Title className="card__title">{b.title}</Card.Title>
                            <Card.Text className="card__description">
                              {b.description}
                            </Card.Text>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
                <CustomPagination
                  totalItems={totalBoards}
                  currentPage={searchParams.get('currentPage') || 1}
                  onPageChange={onPageChange}
                />
              </>
          }
        </Col>
      </Row>
    </BootstrapContainer>
  )
}

export default Boards

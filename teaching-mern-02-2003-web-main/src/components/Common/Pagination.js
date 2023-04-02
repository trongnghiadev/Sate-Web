import React, { useEffect, useState } from 'react'
import ReactPaginate from 'react-paginate'

function CustomPagination({ totalItems, itemsPerPage=12, currentPage=1, onPageChange }) {
  const [pageCount, setPageCount] = useState(+currentPage)

  useEffect(() => {
    setPageCount(Math.ceil(totalItems / itemsPerPage)) // 30
  }, [totalItems, itemsPerPage])

  // Invoke when user click to request another page.
  const handlePageClick = (event) => {
    // console.log(`User requested page number ${(event.selected + 1)}`)
    const selectedPage = event.selected + 1
    onPageChange(selectedPage, itemsPerPage)
  }

  return (
    <ReactPaginate
      initialPage={(+currentPage - 1)} // array chạy từ 0 nên đoạn này đưa vào thư viện xử lý chúng ta cần trừ 1

      breakLabel="..."
      nextLabel="next >"
      onPageChange={handlePageClick}
      pageRangeDisplayed={5}
      pageCount={pageCount}
      previousLabel="< previous"
      renderOnZeroPageCount={null}

      pageClassName="page-item"
      pageLinkClassName="page-link"
      previousClassName="page-item previous"
      previousLinkClassName="page-link previous-link"
      nextClassName="page-item next"
      nextLinkClassName="page-link next-link"
      breakClassName="page-item break"
      breakLinkClassName="page-link break-link"
      containerClassName="pagination"
      activeClassName="active"
    />
  )
}

export default CustomPagination

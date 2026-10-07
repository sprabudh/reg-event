/**
 * Previous/Next pager. Renders the exact .el-pager markup and classes the
 * events pages already used, and renders nothing when there is only one page.
 */
const Pagination = ({ page, totalPages, onChange }) => {
    if (totalPages <= 1) return null;

    return (
        <div className="el-pager">
            <button className="btn btn-secondary" disabled={page === 0} onClick={() => onChange(page - 1)}>Previous</button>
            <span className="el-page-txt">Page {page + 1} of {totalPages}</span>
            <button className="btn btn-secondary" disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}>Next</button>
        </div>
    );
};

export default Pagination;

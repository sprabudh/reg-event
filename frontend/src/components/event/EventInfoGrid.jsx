/**
 * The event "info grid" shared by the admin and host event detail pages.
 * `hostDisplay` is pre-formatted by the caller because the two pages resolve
 * the host label differently.
 */
const EventInfoGrid = ({ event, hostDisplay }) => (
    <div className="ed-info-grid">
        <p className="ed-info-item"><strong>Hosted By:</strong> {hostDisplay}</p>
        <p className="ed-info-item"><strong>Category:</strong> {event.category ? event.category.name : 'N/A'}</p>
        <p className="ed-info-item"><strong>Date:</strong> {event.date}</p>
        <p className="ed-info-item"><strong>Time:</strong> {event.time || 'TBA'}</p>
        <p className="ed-info-item"><strong>Duration:</strong> {event.duration ? (isNaN(event.duration) ? event.duration : `${event.duration} Hours`) : 'TBA'}</p>
        <p className="ed-info-item"><strong>Price:</strong> {!event.price || event.price === 0 ? <span className="ed-text-green">Free</span> : `₹${event.price}`}</p>
        {event.isOnline ? (
            <p className="ed-info-item"><strong>Location:</strong> <span className="ed-text-blue">Online Event</span></p>
        ) : (
            <p className="ed-info-item"><strong>Location:</strong> {event.location || 'TBA'}</p>
        )}
        <p className="ed-info-item"><strong>Cancellation:</strong> {event.isRefundable ? 'Refund Available' : 'No Refund'}</p>
    </div>
);

export default EventInfoGrid;

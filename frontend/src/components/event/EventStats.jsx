/**
 * The registrations/available-seats stat row shared by the admin and host
 * event detail pages.
 */
const EventStats = ({ stats }) => (
    <div className="ed-stats-row">
        <div className="ed-stat-card-purple">
            <h4 className="ed-stat-h4">Total Registrations</h4>
            <p className="ed-stat-value">{stats.registered} / {stats.capacity}</p>
        </div>
        <div className="ed-stat-card-green">
            <h4 className="ed-stat-h4-green">Available Seats</h4>
            <p className="ed-stat-value-green">{stats.available}</p>
        </div>
    </div>
);

export default EventStats;

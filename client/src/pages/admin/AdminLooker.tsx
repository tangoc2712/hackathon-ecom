const AdminLooker = () => {
    return (
        <div className="admin-container">
            <main className="dashboard">
                <div className="bar">
                    <h2 className="heading">Dashboard Looker</h2>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                    <iframe
                        width="100%"
                        height="800"
                        src="https://lookerstudio.google.com/embed/reporting/62cd6413-0b08-4a1c-a03d-6a87ba657c8d/page/OwKhF"
                        frameBorder="0"
                        style={{ border: 0 }}
                        allowFullScreen
                        sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                    ></iframe>
                </div>
            </main>
        </div>
    );
};

export default AdminLooker;

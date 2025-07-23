import React from 'react'
import Header from '../layouts/Header';

const Dashboard = () => {
    return (
        <section className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 
            text-white p-6">
            <div className="max-w-7xl mx-auto">
                <Header />
            </div>
        </section>
    )
}

export default Dashboard;


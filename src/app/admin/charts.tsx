"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    LineChart, Line,
    ResponsiveContainer,
} from "recharts";

const COLORS = ["#005951", "#FDDD29", "#007a6f", "#e67e22", "#3498db", "#9b59b6"];

export function GroupPieChart({ data }: { data: { name: string; value: number }[] }) {
    const renderLabel = (entry: any) => `${entry.name}: ${entry.value}`;
    return (
        <ResponsiveContainer width="100%" height={260}>
            <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={95} dataKey="value" label={renderLabel}>
                    {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
            </PieChart>
        </ResponsiveContainer>
    );
}

export function PassFailPieChart({ data }: { data: { name: string; value: number }[] }) {
    const renderLabel = (entry: any) => `${entry.name}: ${entry.value}`;
    return (
        <ResponsiveContainer width="100%" height={260}>
            <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={95} dataKey="value" label={renderLabel}>
                    <Cell fill="#16a34a" />
                    <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
            </PieChart>
        </ResponsiveContainer>
    );
}

export function ScoreDistributionChart({ data }: { data: { range: string; count: number }[] }) {
    return (
        <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" name="Số bài" fill="#005951" radius={[6, 6, 0, 0] as any} />
            </BarChart>
        </ResponsiveContainer>
    );
}

export function AvgByGroupChart({ data }: { data: { group: string; avg: number }[] }) {
    return (
        <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="group" fontSize={12} />
                <YAxis domain={[0, 100]} fontSize={12} />
                <Tooltip />
                <Bar dataKey="avg" name="TB (%)" fill="#FDDD29" radius={[6, 6, 0, 0] as any} />
            </BarChart>
        </ResponsiveContainer>
    );
}

export function TimelineChart({ data }: { data: { date: string; count: number }[] }) {
    return (
        <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="count" name="Bài nộp" stroke="#005951" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
        </ResponsiveContainer>
    );
}

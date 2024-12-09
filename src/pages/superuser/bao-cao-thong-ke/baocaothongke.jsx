import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Paper, CircularProgress, Button } from "@mui/material";
import { Pie, Bar, Line } from "react-chartjs-2";
import { Link } from 'react-router-dom';
import { ArrowForward } from '@mui/icons-material';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from "chart.js";
import axiosClient from "../../../axiosClient";

// Register chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

const ReportPage = () => {
    const [paymentData, setPaymentData] = useState(null);
    const [appointmentData, setAppointmentData] = useState(null);
    const [paymentLineData, setPaymentLineData] = useState({
        labels: [],
        datasets: [],
    });
    const [appointmentBarChart, SetAppointmentBarChart] = useState([]);

    useEffect(() => {
        const fetchPaymentData = async () => {
            try {
                const response = await axiosClient.get("payments/report-payments");
                const payments = response.data;

                if (!Array.isArray(payments)) {
                    throw new Error("API response không đúng định dạng.");
                }
                const paymentsByMonth = response.data;
                setPaymentLineData({
                    labels: [
                        "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
                        "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
                    ],
                    datasets: [
                        {
                            label: "Tổng số tiền thanh toán (VNĐ)",
                            data: paymentsByMonth,
                            borderColor: "#36A2EB",
                            tension: 0.1,
                            fill: false,
                        },
                    ],
                });
            } catch (error) {
                console.error("Error fetching payment data", error);
            }
        };
        const fetchAppintmentBarChartData = async () => {
            try {
                const response = await axiosClient.get("appointment/report-appointments");
                SetAppointmentBarChart(response.data);
            } catch (error) {
                console.error("Error fetching appointment data", error);
            }
        };
        const fetchRoundPaymentData = async () => {
            try {
                const response = await axiosClient.get("payments/report-round-payments");
                const payments = response.data;
                console.log(payments)
                setPaymentData({
                    labels: ["Tổng tiền thanh toán", "Thành công", "Đang xử lý", "Thất bại"],
                    datasets: [
                        {
                            label: "Thanh toán",
                            data: payments,
                            backgroundColor: ["#36A2EB", "#4CAF50", "#FF9800", "red"],
                        },
                    ],
                });
            } catch (error) {
                console.error("Error fetching payment data", error);
            }
        };
        const fetchAppintmentRoundtData = async () => {
            const response = await axiosClient.get("appointment/round-report-appointments");
            setAppointmentData({
                labels: ["Tổng lịch hẹn", "Chưa xử lý", "Đã xử lý"],
                datasets: [
                    {
                        label: "Lịch hẹn",
                        data: response.data,
                        backgroundColor: ["#FF5722", "#FFC107", "#8BC34A"],
                    },
                ],
            });
        };
        fetchRoundPaymentData();
        fetchAppintmentBarChartData();
        fetchPaymentData();
        fetchAppintmentRoundtData()
    }, []);

    if (!paymentData || !appointmentData) {
        return (
            <Box
                sx={{
                    padding: "20px",
                    backgroundColor: "#f5f5f5",
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold", textAlign: "center" }}>
                    Báo cáo thống kê
                </Typography>
                <CircularProgress sx={{ mb: 2 }} /> {/* Spinner loading */}
                <Typography variant="h6" sx={{ textAlign: "center" }}>
                    Đang tải dữ liệu...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ padding: "20px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold", textAlign: "center" }}>
                Báo cáo thống kê
            </Typography>

            <Grid container spacing={4}>
                {/* Payment Statistics */}
                <Grid item xs={5} md={5} style={{ marginLeft: "100px" }}>
                    <Paper sx={{ padding: "20px", position: 'relative' }}>
                        <Typography variant="h5" sx={{ mb: 2, textAlign: "center", fontWeight: "medium" }}>
                            Thống kê Thanh toán
                        </Typography>
                        <Pie data={paymentData} />

                        {/* Đặt Button với mũi tên bên phải */}
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            marginTop: "20px",
                        }}>
                        </Box>
                        <Button
                            component={Link} // Chuyển hướng tới trang chi tiết thanh toán
                            to="/chi-tiet-thanh-toan" // Đường dẫn trang chi tiết thanh toán
                            variant="contained"
                            color="primary"
                            size="small" // Thay đổi kích thước nút
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                borderRadius: "8px",
                                padding: "6px 12px", // Giảm padding cho nút nhỏ
                                fontWeight: "bold",
                                boxShadow: 2,
                                '&:hover': {
                                    backgroundColor: '#1976d2', // Màu hover của nút
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                                },
                            }}
                        >
                            Chi tiết thanh toán
                            <ArrowForward sx={{ ml: 1 }} /> {/* Biểu tượng mũi tên sang phải */}
                        </Button>
                    </Paper>
                </Grid>

                {/* Appointment Statistics */}
                <Grid item xs={5} md={5}>
                    <Paper sx={{ padding: "20px" }}>
                        <Typography variant="h5" sx={{ mb: 2, textAlign: "center", fontWeight: "medium" }}>
                            Thống kê Lịch hẹn
                        </Typography>
                        <Pie data={appointmentData} /> <Box sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            marginTop: "20px",
                        }}>
                        </Box>
                        <Button
                            component={Link}
                            to="/chi-tiet-lich-hen"
                            variant="contained"
                            color="primary"
                            size="small"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                borderRadius: "8px",
                                padding: "6px 12px",
                                fontWeight: "bold",
                                boxShadow: 2,
                                '&:hover': {
                                    backgroundColor: '#1976d2',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                                },
                            }}
                        >
                            Chi tiết Lịch hẹn
                            <ArrowForward sx={{ ml: 1 }} />
                        </Button>
                    </Paper>
                </Grid>

                {/* Payment Line Chart */}
                <Grid item xs={10} style={{ marginLeft: "100px" }}>
                    <Paper sx={{ padding: "20px" }}>
                        <Typography variant="h5" sx={{ mb: 2, textAlign: "center", fontWeight: "medium" }}>
                            Thanh toán qua các tháng
                        </Typography>
                        <Line data={paymentLineData} />
                    </Paper>
                </Grid>

                {/* Appointment Bar Chart */}
                <Grid item xs={10} style={{ marginLeft: "100px" }}>
                    <Paper sx={{ padding: "20px" }}>
                        <Typography variant="h5" sx={{ mb: 2, textAlign: "center", fontWeight: "medium" }}>
                            Số lượng Lịch hẹn theo trạng thái
                        </Typography>
                        <Bar
                            data={{
                                labels: ["Chưa xử lý", "Đã xử lý"],
                                datasets: [
                                    {
                                        label: "Lịch hẹn",
                                        data: appointmentBarChart,
                                        backgroundColor: [
                                            "#F44336",
                                            "#8BC34A",
                                        ],
                                        borderColor: "#000",
                                        borderWidth: 1,
                                    },
                                ],
                            }}
                            options={{
                                plugins: {
                                    legend: {
                                        labels: {
                                            color: "#F44336",  // Màu chữ của label "Lịch hẹn"
                                        },
                                    },
                                },
                            }}
                        />
                    </Paper>
                </Grid>

            </Grid>
        </Box>
    );
};

export default ReportPage;

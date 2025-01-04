import React, { useEffect, useState, useCallback } from "react";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { message, Pagination } from "antd";
import axiosClient from "../../../axiosClient";
import { CheckCircle, Cancel } from "@mui/icons-material";
import { Tooltip, CircularProgress } from "@mui/material";
const ReceptionistManagement = () => {
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
        total: 0,
    });
    const [patientList, setPatientList] = useState([]);
    const [loading, setLoading] = useState(false); // Trạng thái loading
    const handlePageChange = (page, pageSize) => {
        setPagination({
            current: page,
            pageSize: pageSize,
        });
    };
    const fetchPayments = useCallback(async (page, pageSize) => {
        setLoading(true); // Bật trạng thái loading
        try {
            const params = {
                offset: (page - 1) * pageSize,
                limit: pageSize,
            };
            const response = await axiosClient.get("/receptionist", { params });
            setPatientList(response.data);
            setPagination({
                ...pagination,
                current: page,
                pageSize: pageSize,
                total: response.data.meta.total || 0,
            });
        } catch (err) {
            if (err.response) {
                const { status, data } = err.response;
                const errorMessage = status === 405
                    ? data?.detail?.message || "Hành động không được phép."
                    : "Đã xảy ra lỗi trong quá trình tải dữ liệu.";
                message.error(`Lỗi: ${errorMessage}`, 5);
            } else {
            }
        } finally {
            setLoading(false); // Tắt trạng thái loading
        }
    }, [pagination]);
    useEffect(() => {
        window.scrollTo(0, 0);
        fetchPayments(pagination.current, pagination.pageSize);
    }, [pagination, fetchPayments]);  // Thêm 'pagination' vào mảng phụ thuộc
    return (
        <Box sx={{ padding: "20px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: "light", textAlign: "center", color: "blue" }}>
                Quản lý Lễ tân
            </Typography>
            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
                    <CircularProgress sx={{ mb: 2 }} />
                    <Typography variant="h6" sx={{ textAlign: "center", marginLeft: "15px" }}>
                        Đang tải dữ liệu...
                    </Typography>
                </Box>
            ) : (
                <>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><b>ID</b></TableCell>
                                    <TableCell><b>Tên</b></TableCell>
                                    <TableCell><b>Năm sinh</b></TableCell>
                                    <TableCell><b>Giới tính</b></TableCell>
                                    <TableCell><b>Email</b></TableCell>
                                    <TableCell><b>Vai trò</b></TableCell>
                                    <TableCell><b style={{ marginLeft: "45px" }}>Trạng thái</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {patientList.map((patient) => (
                                    <TableRow key={patient.id}>
                                        <TableCell>{patient.id}</TableCell>
                                        <TableCell>{patient.name}</TableCell>
                                        <TableCell>{patient.dob}</TableCell>
                                        <TableCell>{patient.gender}</TableCell>
                                        <TableCell>{patient.email}</TableCell>
                                        <TableCell>
                                            {patient.role === 'Receptionist' ? 'Lễ Tân' : patient.role}
                                        </TableCell>
                                        <TableCell sx={{ display: 'flex', justifyContent: 'center' }}>
                                            <Tooltip title={patient.is_active ? "Đã kích hoạt" : "Chưa kích hoạt"}>
                                                {patient.is_active ? (
                                                    <CheckCircle style={{ color: "green" }} />
                                                ) : (
                                                    <Cancel style={{ color: "red" }} />
                                                )}
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Pagination
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        pageSizeOptions={["1", "5", "10", "20", "50", "100", "500"]}
                        showSizeChanger
                        onChange={handlePageChange} // Thay đổi trang
                        onShowSizeChange={handlePageChange} // Thay đổi số lượng bản ghi mỗi trang
                        style={{ marginTop: 16, textAlign: "center" }}
                    />
                </>
            )}
        </Box>
    );
};

export default ReceptionistManagement;

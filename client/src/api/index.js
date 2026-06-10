import request from '@/utils/request';

export const getLevels = () => request.get('/levels');
export const getLevel = (id) => request.get(`/levels/${id}`);
export const createLevel = (data) => request.post('/levels', data);
export const updateLevel = (id, data) => request.put(`/levels/${id}`, data);
export const deleteLevel = (id) => request.delete(`/levels/${id}`);

export const getMembers = (params) => request.get('/members', { params });
export const getMember = (id) => request.get(`/members/${id}`);
export const createMember = (data) => request.post('/members', data);
export const updateMember = (id, data) => request.put(`/members/${id}`, data);
export const deleteMember = (id) => request.delete(`/members/${id}`);
export const updateMemberPoints = (id, data) => request.post(`/members/${id}/points`, data);
export const getMemberPointFlows = (id, params) => request.get(`/members/${id}/point-flows`, { params });

export const getPointFlows = (params) => request.get('/point-flows', { params });

export const getCoupons = (params) => request.get('/coupons', { params });
export const getCoupon = (id) => request.get(`/coupons/${id}`);
export const createCoupon = (data) => request.post('/coupons', data);
export const updateCoupon = (id, data) => request.put(`/coupons/${id}`, data);
export const deleteCoupon = (id) => request.delete(`/coupons/${id}`);
export const issueCoupon = (id, data) => request.post(`/coupons/${id}/issue`, data);
export const getMemberCoupons = (memberId, params) => request.get(`/coupons/member/${memberId}`, { params });
export const useCoupon = (memberCouponId, data) => request.post(`/coupons/use/${memberCouponId}`, data);

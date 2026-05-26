import { Membership } from "../models/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const getMemberships = asyncHandler(async (req, res) => {
  const memberships = await Membership.findAll({
    where: {
      is_active: true
    },
    order: [["price", "ASC"]]
  });

  return successResponse(res, "Membership berhasil diambil.", memberships);
});

export const getMembershipById = asyncHandler(async (req, res) => {
  const membership = await Membership.findOne({
    where: {
      id: req.params.id,
      is_active: true
    }
  });

  if (!membership) {
    return errorResponse(res, "Membership tidak ditemukan.", 404);
  }

  return successResponse(res, "Detail membership berhasil diambil.", membership);
});

export const getAdminMemberships = asyncHandler(async (req, res) => {
  const memberships = await Membership.findAll({
    order: [["price", "ASC"]]
  });

  return successResponse(res, "Data membership admin berhasil diambil.", memberships);
});

export const createMembership = asyncHandler(async (req, res) => {
  const membership = await Membership.create(req.body);

  return successResponse(res, "Membership berhasil dibuat.", membership, 201);
});

export const updateMembership = asyncHandler(async (req, res) => {
  const membership = await Membership.findByPk(req.params.id);

  if (!membership) {
    return errorResponse(res, "Membership tidak ditemukan.", 404);
  }

  await membership.update(req.body);

  return successResponse(res, "Membership berhasil diperbarui.", membership);
});

export const deleteMembership = asyncHandler(async (req, res) => {
  const membership = await Membership.findByPk(req.params.id);

  if (!membership) {
    return errorResponse(res, "Membership tidak ditemukan.", 404);
  }

  await membership.update({ is_active: false });

  return successResponse(res, "Membership berhasil dinonaktifkan.", membership);
});

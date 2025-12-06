import {
  vendorUserCreateSchema,
  vendorUserUpdateSchema,
  vendorUserViewSchema,
} from "../vendorUser.schema";

export const validationPolicies = {
  vendorUser: {
    create: vendorUserCreateSchema,
    update: vendorUserUpdateSchema,
    view: vendorUserViewSchema,
  },
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyController = void 0;
const companyService_1 = require("../services/companyService");
const companyValidation_1 = require("../validations/companyValidation");
class CompanyController {
    static async getAllCompanies(req, res) {
        try {
            const companies = await companyService_1.CompanyService.getAllCompanies();
            res.json({
                message: 'Companies retrieved successfully',
                data: companies
            });
        }
        catch (error) {
            console.error('Get companies error:', error);
            res.status(500).json({ error: error.message || 'Failed to get companies' });
        }
    }
    static async getCompanyById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const includeDetails = req.query.details === 'true';
            if (isNaN(id)) {
                return res.status(400).json({ error: 'Invalid company ID' });
            }
            const company = await companyService_1.CompanyService.getCompanyById(id, includeDetails);
            res.json({
                message: 'Company retrieved successfully',
                data: company
            });
        }
        catch (error) {
            console.error('Get company error:', error);
            if (error.message === 'Company not found') {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: error.message || 'Failed to get company' });
        }
    }
    static async createCompany(req, res) {
        try {
            const { error } = companyValidation_1.createCompanyValidation.validate(req.body);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }
            const company = await companyService_1.CompanyService.createCompany(req.body);
            res.status(201).json({
                message: 'Company created successfully',
                data: company
            });
        }
        catch (error) {
            console.error('Create company error:', error);
            if (error.message === 'RFC already exists') {
                return res.status(409).json({ error: error.message });
            }
            res.status(500).json({ error: error.message || 'Failed to create company' });
        }
    }
    static async updateCompany(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ error: 'Invalid company ID' });
            }
            const { error } = companyValidation_1.updateCompanyValidation.validate(req.body);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }
            const company = await companyService_1.CompanyService.updateCompany({ id, ...req.body });
            res.json({
                message: 'Company updated successfully',
                data: company
            });
        }
        catch (error) {
            console.error('Update company error:', error);
            if (error.message === 'Company not found') {
                return res.status(404).json({ error: error.message });
            }
            if (error.message === 'RFC already exists') {
                return res.status(409).json({ error: error.message });
            }
            res.status(500).json({ error: error.message || 'Failed to update company' });
        }
    }
    static async deleteCompany(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ error: 'Invalid company ID' });
            }
            const result = await companyService_1.CompanyService.deleteCompany(id);
            res.json({
                message: result.message,
                data: { companyId: result.companyId }
            });
        }
        catch (error) {
            console.error('Delete company error:', error);
            if (error.message.includes('Cannot delete')) {
                return res.status(409).json({ error: error.message });
            }
            res.status(500).json({ error: error.message || 'Failed to delete company' });
        }
    }
    static async getCompanyStats(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ error: 'Invalid company ID' });
            }
            const stats = await companyService_1.CompanyService.getCompanyStats(id);
            res.json({
                message: 'Company statistics retrieved successfully',
                data: stats
            });
        }
        catch (error) {
            console.error('Get company stats error:', error);
            if (error.message === 'Company not found') {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: error.message || 'Failed to get company statistics' });
        }
    }
}
exports.CompanyController = CompanyController;
//# sourceMappingURL=companyController.js.map
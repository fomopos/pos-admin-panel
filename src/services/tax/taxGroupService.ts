import { apiClient } from '../api';
import type {
  TaxGroup,
  TaxRule,
  CreateTaxGroupRequest,
  UpdateTaxGroupRequest,
  CreateTaxRuleRequest,
  UpdateTaxRuleRequest,
  TaxGroupQueryParams,
  TaxGroupListResponse,
  TaxRuleListResponse,
  TaxServiceError
} from '../types/tax.types';

export class TaxGroupService {
  private readonly basePath = '/tax/groups';

  /**
   * Get all tax groups
   */
  async getTaxGroups(params?: TaxGroupQueryParams): Promise<TaxGroup[]> {
    try {
      const response = await apiClient.get<TaxGroupListResponse>(this.basePath, params);
      return response.data.tax_groups;
    } catch (error) {
      console.error('Failed to fetch tax groups:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get a specific tax group by ID
   */
  async getTaxGroupById(groupId: string, params?: TaxGroupQueryParams): Promise<TaxGroup> {
    try {
      const response = await apiClient.get<TaxGroup>(`${this.basePath}/${groupId}`, params);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch tax group ${groupId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Create a new tax group
   */
  async createTaxGroup(data: CreateTaxGroupRequest): Promise<TaxGroup> {
    try {
      // Validate required fields
      this.validateTaxGroupData(data);
      
      const response = await apiClient.post<TaxGroup>(this.basePath, data);
      return response.data;
    } catch (error) {
      console.error('Failed to create tax group:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing tax group
   */
  async updateTaxGroup(groupId: string, data: UpdateTaxGroupRequest): Promise<TaxGroup> {
    try {
      // Validate required fields
      this.validateTaxGroupData(data, false);
      
      const response = await apiClient.put<TaxGroup>(`${this.basePath}/${groupId}`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update tax group ${groupId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete a tax group
   */
  async deleteTaxGroup(groupId: string): Promise<void> {
    try {
      await apiClient.delete<void>(`${this.basePath}/${groupId}`);
    } catch (error) {
      console.error(`Failed to delete tax group ${groupId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Get tax rules for a specific group
   */
  async getTaxRules(groupId: string): Promise<TaxRule[]> {
    try {
      const response = await apiClient.get<TaxRuleListResponse>(`${this.basePath}/${groupId}/rules`);
      return response.data.tax_rules;
    } catch (error) {
      console.error(`Failed to fetch tax rules for group ${groupId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Add a tax rule to a group
   */
  async addTaxRule(groupId: string, data: CreateTaxRuleRequest): Promise<TaxRule> {
    try {
      // Validate required fields
      this.validateTaxRuleData(data);
      
      const response = await apiClient.post<TaxRule>(`${this.basePath}/${groupId}/rules`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to add tax rule to group ${groupId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Update a tax rule in a group
   */
  async updateTaxRule(groupId: string, ruleSeq: number, data: UpdateTaxRuleRequest): Promise<TaxRule> {
    try {
      // Validate required fields
      this.validateTaxRuleData(data, false);
      
      const response = await apiClient.put<TaxRule>(`${this.basePath}/${groupId}/rules/${ruleSeq}`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update tax rule ${ruleSeq} in group ${groupId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete a tax rule from a group
   */
  async deleteTaxRule(groupId: string, ruleSeq: number): Promise<void> {
    try {
      await apiClient.delete<void>(`${this.basePath}/${groupId}/rules/${ruleSeq}`);
    } catch (error) {
      console.error(`Failed to delete tax rule ${ruleSeq} from group ${groupId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Calculate total tax rate for a group
   */
  getTotalTaxRate(group: TaxGroup): number {
    return group.group_rule.reduce((total, rule) => total + rule.percentage, 0);
  }

  /**
   * Validate tax group data
   */
  private validateTaxGroupData(data: CreateTaxGroupRequest | UpdateTaxGroupRequest, isCreate: boolean = true): void {
    const errors: TaxServiceError[] = [];

    if (isCreate && !data.tax_group_id) {
      errors.push({
        code: 'REQUIRED_FIELD',
        message: 'Tax Group ID is required',
        field: 'tax_group_id'
      });
    }

    if (isCreate && !data.name) {
      errors.push({
        code: 'REQUIRED_FIELD',
        message: 'Tax Group name is required',
        field: 'name'
      });
    }

    if (isCreate && !data.description) {
      errors.push({
        code: 'REQUIRED_FIELD',
        message: 'Tax Group description is required',
        field: 'description'
      });
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.map(e => e.message).join(', ')}`);
    }
  }

  /**
   * Validate tax rule data
   */
  private validateTaxRuleData(data: CreateTaxRuleRequest | UpdateTaxRuleRequest, isCreate: boolean = true): void {
    const errors: TaxServiceError[] = [];

    if (isCreate && data.tax_rule_seq === undefined) {
      errors.push({
        code: 'REQUIRED_FIELD',
        message: 'Tax rule sequence is required',
        field: 'tax_rule_seq'
      });
    }

    if (isCreate && !data.tax_authority_id) {
      errors.push({
        code: 'REQUIRED_FIELD',
        message: 'Tax authority ID is required',
        field: 'tax_authority_id'
      });
    }

    if (isCreate && !data.name) {
      errors.push({
        code: 'REQUIRED_FIELD',
        message: 'Tax rule name is required',
        field: 'name'
      });
    }

    if (data.percentage !== undefined && (data.percentage < 0 || data.percentage > 1)) {
      errors.push({
        code: 'INVALID_VALUE',
        message: 'Tax percentage must be between 0 and 1 (0% to 100%)',
        field: 'percentage'
      });
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.map(e => e.message).join(', ')}`);
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (error instanceof Error) {
      return error;
    }
    
    return new Error('An unexpected error occurred while processing tax group request');
  }

  /**
   * Mock data for development/testing
   */
  async getMockTaxGroups(): Promise<TaxGroup[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        tax_group_id: "0",
        name: "No Tax",
        description: "No Tax",
        group_rule: [
          {
            tax_rule_seq: 1,
            tax_authority_id: "IN-CGST",
            name: "Central GST",
            description: "Central GST",
            tax_type_code: "VAT",
            fiscal_tax_id: "A",
            effective_datetime: null,
            expr_datetime: null,
            percentage: 0,
            amount: null
          },
          {
            tax_rule_seq: 2,
            tax_authority_id: "IN-SGST",
            name: "State GST",
            description: "State GST",
            tax_type_code: "VAT",
            fiscal_tax_id: "A",
            effective_datetime: null,
            expr_datetime: null,
            percentage: 0,
            amount: null
          }
        ]
      },
      {
        tax_group_id: "GST18",
        name: "GST 18%",
        description: "GST 18%",
        group_rule: [
          {
            tax_rule_seq: 1,
            tax_authority_id: "IN-CGST",
            name: "Central GST",
            description: "Central GST",
            tax_type_code: "VAT",
            fiscal_tax_id: "D",
            effective_datetime: null,
            expr_datetime: null,
            percentage: 0.09,
            amount: null
          },
          {
            tax_rule_seq: 2,
            tax_authority_id: "IN-SGST",
            name: "State GST",
            description: "State GST",
            tax_type_code: "VAT",
            fiscal_tax_id: "D",
            effective_datetime: null,
            expr_datetime: null,
            percentage: 0.09,
            amount: null
          }
        ]
      }
    ];
  }
}

// Create and export a singleton instance
export const taxGroupService = new TaxGroupService();

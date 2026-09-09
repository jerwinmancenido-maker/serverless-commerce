/**
 * @file    apps/backend/src/workflows/manage-research-library.ts
 * @module  ManageResearchLibraryWorkflows
 * @purpose Orchestrates workflows for managing peer-reviewed scientific articles and peptide comparisons.
 * @contracts
 *   Workflow: createPeptideComparisonWorkflow · updatePeptideComparisonWorkflow · deletePeptideComparisonWorkflow
 *   Workflow: createResearchArticleWorkflow · updateResearchArticleWorkflow · deleteResearchArticleWorkflow
 */

import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"

import {
  createPeptideComparisonStep,
  createResearchArticleStep,
  deletePeptideComparisonStep,
  deleteResearchArticleStep,
  updatePeptideComparisonStep,
  updateResearchArticleStep,
  type CreatePeptideComparisonStepInput,
  type CreateResearchArticleStepInput,
  type DeleteEntityStepInput,
  type UpdatePeptideComparisonStepInput,
  type UpdateResearchArticleStepInput,
} from "./steps/manage-research-library"

export const createPeptideComparisonWorkflow = createWorkflow(
  "create-peptide-comparison",
  (input: CreatePeptideComparisonStepInput) =>
    new WorkflowResponse(createPeptideComparisonStep(input)),
)

export const updatePeptideComparisonWorkflow = createWorkflow(
  "update-peptide-comparison",
  (input: UpdatePeptideComparisonStepInput) =>
    new WorkflowResponse(updatePeptideComparisonStep(input)),
)

export const deletePeptideComparisonWorkflow = createWorkflow(
  "delete-peptide-comparison",
  (input: DeleteEntityStepInput) =>
    new WorkflowResponse(deletePeptideComparisonStep(input)),
)

export const createResearchArticleWorkflow = createWorkflow(
  "create-research-article",
  (input: CreateResearchArticleStepInput) =>
    new WorkflowResponse(createResearchArticleStep(input)),
)

export const updateResearchArticleWorkflow = createWorkflow(
  "update-research-article",
  (input: UpdateResearchArticleStepInput) =>
    new WorkflowResponse(updateResearchArticleStep(input)),
)

export const deleteResearchArticleWorkflow = createWorkflow(
  "delete-research-article",
  (input: DeleteEntityStepInput) =>
    new WorkflowResponse(deleteResearchArticleStep(input)),
)

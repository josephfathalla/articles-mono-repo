import { Prisma, PrismaClient } from "@my-better-t-app/db";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { Request, Response } from "express";
import { Querybuilder, QueryResponse } from "nestjs-prisma-querybuilder";
import { DatabaseService } from "./database.service";

@Injectable()
export class QuerybuilderService {
  @Inject(REQUEST)
  private readonly request!: Request & { res?: Response };

  private readonly querybuilder: Querybuilder;
  private readonly databaseService: DatabaseService;

  constructor(querybuilder: Querybuilder, databaseService: DatabaseService) {
    this.querybuilder = querybuilder;
    this.databaseService = databaseService;
  }

  /**
   *
   * @param model model name on schema.prisma;
   * @param primaryKey primaryKey name for this model on prisma.schema;
   * @param where object to 'where' using the prisma rules;
   * @param mergeWhere define if the previous where will be merged with the query where or replace that;
   * @param justPaginate remove any 'select' and 'include'
   * @param setHeaders define if will set response headers 'count' and 'page'
   * @param depth limit the the depth to filter/populate. default is '_5_'
   * @param forbiddenFields fields that will be removed from any select/filter/populate/sort
   *
   */
  async query({
    model,
    depth,
    where,
    mergeWhere,
    justPaginate,
    forbiddenFields,
    primaryKey = "id",
    setHeaders = true,
  }: {
    model: Prisma.ModelName;
    // biome-ignore lint/suspicious/noExplicitAny: Prisma where input is complex
    where?: any;
    depth?: number;
    primaryKey?: string;
    mergeWhere?: boolean;
    setHeaders?: boolean;
    justPaginate?: boolean;
    forbiddenFields?: string[];
  }): Promise<{
    query: Partial<QueryResponse>;
    meta: {
      pagination: {
        total: number;
        page: number;
        pageSize: number;
        pageCount: number;
      };
    };
  }> {
    return await this.querybuilder
      .query(primaryKey, depth, setHeaders, forbiddenFields)
      .then(async (query) => {
        if (where) {
          query.where = mergeWhere ? { ...query.where, ...where } : where;
        }

        let count = 0;
        let pageCount = 0;
        const pageSize = this.request.query.limit
          ? Number.parseInt(this.request.query.limit as string, 10)
          : 10;
        const page = this.request.query.page
          ? Number.parseInt(this.request.query.page as string, 10)
          : 1;
        const prismaClient = this.databaseService
          .prisma as unknown as PrismaClient;
        // biome-ignore lint/suspicious/noExplicitAny: Dynamic model access
        const modelDelegate = (prismaClient as any)[model];
        if (modelDelegate) {
          count = await modelDelegate.count({ where: query.where });
          pageCount = Math.ceil(count / pageSize);
        }
        if (setHeaders) {
          this.request.res?.setHeader("count", count.toString());
        }

        if (justPaginate) {
          const { include: _include, select: _select, ...rest } = query;
          return {
            query: { ...rest },
            meta: { pagination: { total: count, page, pageSize, pageCount } },
          };
        }

        return {
          query,
          meta: { pagination: { total: count, page, pageSize, pageCount } },
        };
      })
      .catch((err) => {
        if (err.response?.message) {
          throw new BadRequestException(err.response?.message);
        }
        throw new BadRequestException(
          "Internal error processing your query string, check your parameters"
        );
      });
  }
}

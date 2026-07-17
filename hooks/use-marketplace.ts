import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getBackendURL } from "@/utils/utilities";
import { toast } from "sonner";

export interface PublicLab {
  id: string;
  title: string;
  description: string | null;
  creatorId: string;
  creatorName: string;
  difficulty: string | null;
  subject: string | null;
  programmingLanguage: string | null;
  modulesCount: number;
  problemsCount: number;
  duplicateCount: number;
  averageRating: number;
  ratingCount: number;
  publishedAt: string;
  updatedAt: string;
  tags: { id: string; name: string }[];
}

export interface PublicLabPreview {
  id: string;
  title: string;
  description: string | null;
  creator: { id: string; name: string };
  difficulty: string | null;
  subject: string | null;
  programmingLanguage: string | null;
  estimatedDuration: number | null;
  modulesCount: number;
  modules: {
    id: string;
    title: string;
    description: string | null;
    weekNumber: number;
    orderIndex: number | null;
    problemsCount: number;
    problems: {
      id: string;
      problemId: string;
      orderIndex: number | null;
      problem: { id: string; number: number; title: string; difficulty: string };
    }[];
  }[];
  duplicateCount: number;
  averageRating: number;
  ratingCount: number;
  publishedAt: string;
  tags: { id: string; name: string }[];
}

export interface LabAnalytics {
  duplicateCount: number;
  averageRating: number;
  ratingCount: number;
  reviewCount: number;
  publishedAt: string | null;
  updatedAt: string;
}

export interface MarketplaceQuery {
  search?: string;
  page?: number;
  limit?: number;
  sort?: "newest" | "updated" | "most_duplicated" | "highest_rated";
  difficulty?: string;
  subject?: string;
  programmingLanguage?: string;
  tagIds?: string[];
}

interface MarketplaceResponse {
  data: PublicLab[];
  total: number;
  page: number;
  pages: number;
}

// ── Browse marketplace labs ──

export function useMarketplaceLabs(query: MarketplaceQuery) {
  const [data, setData] = useState<PublicLab[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchLabs = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = { ...query };
      if (params.tagIds?.length) {
        params.tagIds = params.tagIds.join(",");
      }
      const res = await axios.get<MarketplaceResponse>(
        `${getBackendURL()}/marketplace/labs`,
        { params, withCredentials: true },
      );
      setData(res.data.data);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch labs");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(query)]);

  useEffect(() => {
    fetchLabs();
  }, [fetchLabs]);

  return { data, total, pages, loading, refetch: fetchLabs };
}

// ── Get preview of a public lab ──

export function useMarketplaceLabPreview(labId: string | null) {
  const [data, setData] = useState<PublicLabPreview | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!labId) return;
    try {
      setLoading(true);
      const res = await axios.get<PublicLabPreview>(
        `${getBackendURL()}/marketplace/labs/${labId}/preview`,
        { withCredentials: true },
      );
      setData(res.data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load lab");
    } finally {
      setLoading(false);
    }
  }, [labId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, refetch: fetch };
}

// ── Duplicate a lab ──

export function useDuplicateLab() {
  const [loading, setLoading] = useState(false);

  const duplicate = async (labId: string): Promise<any> => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${getBackendURL()}/marketplace/labs/${labId}/duplicate`,
        {},
        { withCredentials: true },
      );
      toast.success("Lab duplicated successfully!");
      return res.data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to duplicate lab");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { duplicate, loading };
}

// ── Rate a lab ──

export function useRateLab() {
  const [loading, setLoading] = useState(false);

  const rate = async (labId: string, score: number, review?: string) => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${getBackendURL()}/marketplace/labs/${labId}/rate`,
        { score, review },
        { withCredentials: true },
      );
      toast.success("Rating submitted!");
      return res.data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to submit rating");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { rate, loading };
}

// ── Publish a lab ──

export function usePublishLab() {
  const [loading, setLoading] = useState(false);

  const publish = async (labId: string) => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${getBackendURL()}/teacher/labs/${labId}/publish`,
        { confirm: true },
        { withCredentials: true },
      );
      toast.success("Lab published to marketplace!");
      return res.data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to publish lab");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { publish, loading };
}

// ── Unpublish a lab ──

export function useUnpublishLab() {
  const [loading, setLoading] = useState(false);

  const unpublish = async (labId: string) => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${getBackendURL()}/teacher/labs/${labId}/unpublish`,
        {},
        { withCredentials: true },
      );
      toast.success("Lab unpublished");
      return res.data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to unpublish lab");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { unpublish, loading };
}

// ── Get lab analytics ──

export function useLabAnalytics(labId: string | null) {
  const [data, setData] = useState<LabAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!labId) return;
    try {
      setLoading(true);
      const res = await axios.get<LabAnalytics>(
        `${getBackendURL()}/teacher/labs/${labId}/analytics`,
        { withCredentials: true },
      );
      setData(res.data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [labId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, refetch: fetch };
}

// ── Check if user has duplicated a lab ──

export function useCheckDuplicated(labId: string | null) {
  const [hasDuplicated, setHasDuplicated] = useState(false);
  const [duplicateLab, setDuplicateLab] = useState<{ id: string; title: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const check = useCallback(async () => {
    if (!labId) return;
    try {
      setLoading(true);
      const res = await axios.get<{ hasDuplicated: boolean; duplicate?: { id: string; title: string } }>(
        `${getBackendURL()}/marketplace/labs/${labId}/duplicated`,
        { withCredentials: true },
      );
      setHasDuplicated(res.data.hasDuplicated);
      setDuplicateLab(res.data.duplicate ?? null);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, [labId]);

  useEffect(() => {
    check();
  }, [check]);

  return { hasDuplicated, duplicateLab, loading, refetch: check };
}

// ── Get all tags for filter ──

export function useTags() {
  const [data, setData] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get<{ id: string; name: string }[]>(
        `${getBackendURL()}/marketplace/tags`,
        { withCredentials: true },
      );
      setData(res.data);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, refetch: fetch };
}

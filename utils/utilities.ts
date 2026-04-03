
export function getBackendURL() {
  return process.env.NEXT_PUBLIC_BACKEND_DOMAIN || "internal-codecoliseum-backend-alb-745028571.ap-south-1.elb.amazonaws.com";
}


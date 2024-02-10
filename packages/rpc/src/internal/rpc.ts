import type * as Headers from "@effect/platform/Http/Headers"
import type * as Schema from "@effect/schema/Schema"
import type * as Serializable from "@effect/schema/Serializable"
import * as Equal from "effect/Equal"
import * as Hash from "effect/Hash"
import * as Request from "effect/Request"
import type * as Rpc from "../Rpc.js"

/** @internal */
export const withRequestTag = <A>(
  f: (
    request: Serializable.SerializableWithResult<any, any, any, any, any, any, any, any>
  ) => A
) => {
  const cache = new Map<string, A>()
  return (request: Schema.TaggedRequest.Any): A => {
    let result = cache.get(request._tag)
    if (result !== undefined) {
      return result
    }
    result = f(request as any)
    cache.set(request._tag, result)
    return result
  }
}

/** @internal */
export const StreamRequestTypeId = Symbol.for("@effect/rpc/Rpc/StreamRequest")

/** @internal */
export const makeRequest = <A extends Schema.TaggedRequest.Any>(
  options: {
    readonly request: A
    readonly traceId: string
    readonly spanId: string
    readonly sampled: boolean
    readonly headers: Headers.Headers
  }
): Rpc.Request<A> => ({
  ...options,
  [Request.RequestTypeId]: undefined as any,
  [Equal.symbol](that: Rpc.Request<A>) {
    return Equal.equals(options.request, that.request)
  },
  [Hash.symbol]() {
    return Hash.combine(Hash.hash(options.request))
  }
} as Rpc.Request<A>)

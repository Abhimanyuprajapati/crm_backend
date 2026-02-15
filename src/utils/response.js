
export const success = (res, message, data={}, statusCode = 200, meta = null)=>{
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        ...meta && {meta}
    })
}

export const error = (res, message, statusCode=500, error=null)=>{
    return res.status(statusCode).json({
        success: false,
        message,
        ...error && {error}
    })
}


export const created = (res, message = "Created", data = {}) =>
  res.status(201).json({ success: true, message, data });

export const badRequest = (res, message = "Bad Request", errors = null) =>
  res.status(400).json({ success: false, message, errors });

export const unauthorized = (res, message = "Unauthorized") =>
  res.status(401).json({ success: false, message });

export const notFound = (res, message = "Not Found") =>
  res.status(404).json({ success: false, message });

export const serverError = (res, message = "Internal Server Error") =>
  res.status(500).json({ success: false, message });
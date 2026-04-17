package com.seat.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private T data;
    private ErrorInfo error;

    public static <T> ApiResponse<T> success(T data) {
        ApiResponse<T> r = new ApiResponse<>(); r.setData(data); return r;
    }
    public static <T> ApiResponse<T> error(String code, String message) {
        ApiResponse<T> r = new ApiResponse<>(); r.setError(new ErrorInfo(code, message)); return r;
    }

    @Data public static class ErrorInfo {
        private final String code; private final String message;
    }
}

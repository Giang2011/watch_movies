package com.netflix.dtos;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;

/**
 * A Jackson-friendly wrapper around {@link PageImpl} that can be serialized/deserialized
 * to/from JSON for Redis caching. Standard {@code PageImpl} lacks a default or
 * property-based constructor, so Jackson cannot reconstruct it from cached JSON.
 *
 * @param <T> the type of elements in the page
 */
@JsonIgnoreProperties(ignoreUnknown = true, value = {"pageable"})
public class RestPage<T> extends PageImpl<T> {

    private static final long serialVersionUID = 1L;

    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public RestPage(
            @JsonProperty("content") List<T> content,
            @JsonProperty("number") int number,
            @JsonProperty("size") int size,
            @JsonProperty("totalElements") long totalElements
    ) {
        super(content, PageRequest.of(number, size), totalElements);
    }

    public RestPage(org.springframework.data.domain.Page<T> page) {
        super(page.getContent(), page.getPageable(), page.getTotalElements());
    }
}

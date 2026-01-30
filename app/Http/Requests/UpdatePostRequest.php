<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('post'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $postId = $this->route('post');

        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('posts', 'slug')->ignore($postId)],
            'content' => ['nullable', 'string'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'published' => ['boolean'],
            'published_at' => ['nullable', 'date'],
            'user_id' => ['nullable', 'exists:users,id'],
            'category' => ['nullable', 'string', 'max:100'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'featured' => ['boolean'],
            'categories' => ['nullable', 'array'],
            'categories.*' => ['exists:categories,id'],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('title') && ! $this->has('slug')) {
            $this->merge([
                'slug' => \Illuminate\Support\Str::slug($this->title),
            ]);
        }
    }
}

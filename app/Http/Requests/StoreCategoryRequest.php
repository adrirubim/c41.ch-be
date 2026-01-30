<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class StoreCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\Category::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100', 'unique:categories,name'],
            'slug' => ['required', 'string', 'max:100', 'unique:categories,slug'],
            'description' => ['nullable', 'string', 'max:500'],
            'color' => ['nullable', 'string', 'max:7', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'El nombre de la categoría es obligatorio.',
            'name.unique' => 'Ya existe una categoría con este nombre.',
            'slug.required' => 'El slug es obligatorio.',
            'slug.unique' => 'Ya existe una categoría con este slug.',
            'color.regex' => 'El color debe ser un código hexadecimal válido (ej: #FF5733).',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('name') && ! $this->has('slug')) {
            $this->merge([
                'slug' => Str::slug($this->name),
            ]);
        }
    }
}

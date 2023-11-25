<template>
    <h1>Sumário</h1>
    <a v-for="post in posts" :href="post.slug">{{ post.header.title }}</a>
</template>

<script lang="ts" setup>
const { data: posts } = await useFetch('/api/posts');
</script>